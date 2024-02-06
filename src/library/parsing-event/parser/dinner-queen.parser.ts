import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';
import { setTimeout } from 'timers/promises';

import { ConfigService } from '@nestjs/config';
import { ParseEventLogger } from '../../custom-logger/parse-event-logger/parse-event.logger';
import { PrismaService } from '../../prisma/prisma.service';
import { chunkArray } from '../../utils/chunkArray';
import { IDinnerQueenParser } from './type/dinner-queen.parser.interface';

@Injectable()
export class DinnerQueenParser implements IDinnerQueenParser.Base {
  private readonly NODE_ENV = this.configService.getOrThrow<string>('NODE_ENV');

  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly logger: ParseEventLogger,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 디너퀸의 모든 캠페인을 가져와서 저장한다
   * @param options.postIdList 파싱할 포스트 id 리스트 (없을 경우 전체 리스트를 가져와 업데이트)
   * @param options.eventId 이벤트 id
   */
  async runWorker(options: IDinnerQueenParser.RunWorkerOptions): Promise<IDinnerQueenParser.RunWorkerResult> {
    const { postIdList, eventId } = options;
    const chunkSize = 1;
    const requestDelay = 1000; // 상세 정보 요청 후 대기 시간
    this.logger.log(`작업 시작`, 'runDinnerQueen', eventId);

    // SECTION: 요청한 id가 없을 경우 디너퀸 전체 리스트를 가져온다
    const taskList: string[] = postIdList ?? [];
    if (taskList.length === 0) {
      try {
        const allList = await this.getAllIdList();
        taskList.push(...allList);
      } catch (error) {
        this.logger.error(`전체 리스트를 가져오는데 실패했습니다`, error, 'runDinnerQueen', eventId);
      }
    }
    this.logger.log(`갱신 대기 리스트 ${taskList.length}개`, 'runDinnerQueen');

    // SECTION: 리스트를 chunkSize만큼 나눠서 상세정보를 요청 후 저장한다
    let successCount = 0;
    let failedCount = 0;
    const chunkedTaskList = chunkArray(chunkSize, taskList);
    for (const ids of chunkedTaskList) {
      // 상세 정보를 가져와서 저장한다
      const taskResult = await Promise.allSettled(
        ids.map(async (id) => {
          const detail = await this.getDetailById(id);
          await this.upsertCampaign(detail);
        }),
      );

      // 작업 결과를 확인해서 실패한 작업이 있을 경우 작업을 중단한다
      const failedTask = taskResult.filter((result) => result.status === 'rejected') as PromiseRejectedResult[];
      const successTask = taskResult.filter((result) => result.status === 'fulfilled') as PromiseFulfilledResult<any>[];
      successCount += successTask.length;
      if (failedTask.length > 0) {
        failedCount += failedTask.length;
        failedTask.forEach((failTask) => {
          this.logger.error(`처리 실패`, failTask.reason, 'runDinnerQueen', eventId);
        });
        break;
      }

      // 대기 시간을 준다
      await setTimeout(requestDelay);
    }

    this.logger.log(
      `작업 종료 총 ${taskList.length}건, 완료 ${successCount}건, 실패 ${failedCount}건, 보류 ${taskList.length - successCount - failedCount}건`,
      'runDinnerQueen',
      eventId,
    );

    return { total: taskList.length, successCount, failedCount };
  }

  /**
   * 현재 진행중인 모든 캠페인 리스트를 가져온다
   */
  async getAllIdList(): Promise<IDinnerQueenParser.GetAllIdListResult> {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
      ...(this.NODE_ENV === 'prod' ? { executablePath: '/usr/bin/chromium-browser' } : {}),
    });
    const page = await browser.newPage();
    const scrollDelay = 300;
    const status = await page.goto('https://dinnerqueen.net/taste', { waitUntil: 'domcontentloaded', timeout: 1200000 });
    this.logger.log(`페이지 로딩 상태 ${status.status()}`, 'getAllIdList');

    let lastHeight = await page.evaluate('document.body.scrollHeight');
    while (true) {
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      // 조건부 대기를 추가하여 실제로 스크롤이 발생했는지 확인
      try {
        await page.waitForFunction(`document.body.scrollHeight > ${lastHeight}`, { timeout: 1200000 });
      } catch (e) {
        break; // 더 이상 스크롤이 발생하지 않으면 반복문 탈출
      }
      await page.waitForTimeout(scrollDelay); // 스크롤 사이의 지연 시간

      const newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight === lastHeight) {
        break; // 페이지 끝에 도달했을 경우 반복문 탈출
      }
      lastHeight = newHeight;
    }

    // #taste_list 내의 a.qz-dq-card__link 셀렉터를 사용하여 모든 링크 선택
    const pageIds = await page.evaluate(() => {
      const links = document.querySelectorAll('#taste_list .qz-dq-card__link');
      const hrefs = Array.from(links).map((link) => link.getAttribute('href').split('/')[2]); // 각 링크의 href 속성 추출
      return hrefs; // 추출된 href 배열 반환
    });

    await browser.close();
    return pageIds;
  }

  /**
   * 캠페인의 상세 정보를 가져온다
   */
  async getDetailById(id: string): Promise<IDinnerQueenParser.GetDetailByIdResult> {
    const requestUrl = `https://dinnerqueen.net/taste/${id}`;
    const detailResponse = await lastValueFrom(this.httpService.get(requestUrl));
    const $ = cheerio.load(detailResponse.data);

    const title = this.getTitle($);
    const campaignDates = this.getDateTime($);
    const thumbnail = this.getThumbnail($);
    const address = this.getAddress($);
    const recruitment = this.getRecruitment($);
    const category = this.getCategory($);
    return { ...campaignDates, ...recruitment, title, thumbnail, address, category, originUrl: requestUrl, id };
  }

  /**
   * 캠페인의 제목을 가져온다
   */
  private getTitle($: cheerio.CheerioAPI) {
    const element = $('#TasteDetailTitle.qz-grid');
    const strongElement = element.find('strong.keep-a');
    const titleText = strongElement.text().trim();

    return titleText || null;
  }

  /**
   * 캠페인의 응모 시작일, 응모 종료일, 추첨일을 가져온다
   */
  private getDateTime($: cheerio.CheerioAPI) {
    const dateElement = $('.qz-col.pc9');
    // "24.02.02 – 24.02.12" 형식으로 되어있는 campaignDates를 배열로 반환
    const campaignDates = dateElement.find('p:nth-child(1)').text().trim().split(' – ');
    // 24.02.13 형식
    const drawDateString = dateElement.find('p:nth-child(2)').text().trim();

    // campaignDates가 2개가 아니거나, drawDateString이 없으면 null 반환
    if (campaignDates.length !== 2 || !drawDateString) return null;

    return {
      // 응모 시작일
      startedAt: DateTime.fromFormat(campaignDates[0].trim(), 'yy.MM.dd').minus({ hours: 9 }).toJSDate(),
      // 응모 종료일
      endedAt: DateTime.fromFormat(campaignDates[1].trim(), 'yy.MM.dd').minus({ hours: 9 }).toJSDate(),
      // 추첨일
      drawAt: DateTime.fromFormat(drawDateString, 'yy.MM.dd').minus({ hours: 9 }).toJSDate(),
    };
  }

  /**
   * 캠페인의 썸네일을 가져온다
   */
  private getThumbnail($: cheerio.CheerioAPI) {
    const imageElement = $('.carousel-img-test');
    const imageURL = imageElement.first().find('img').attr('src');
    if (imageURL) return imageURL;

    // 썸네일이 존재하지 않을 경우 og:image를 사용
    const ogImageUrl = $('meta[property="og:image"]').attr('content');
    return ogImageUrl;
  }

  /**
   * 캠페인의 방문 위치를 가져온다
   */
  private getAddress($: cheerio.CheerioAPI) {
    // 태그가 없는 경우 null 반환
    const address = $('p.qz-body-kr.mb-qz-body2-kr.mr-t2.mr-b1').text().trim();
    if (!address) return null;

    // 태그 내용이 없는 경우 null 반환
    const addressDetail = address.split('방문 위치:\n')[1]?.trim() || null;
    if (!addressDetail) return null;
    return addressDetail;
  }

  /**
   * 캠페인의 모집인원, 신청인원을 가져온다
   */
  private getRecruitment($: cheerio.CheerioAPI) {
    const totalParentElement = $('.qz-h6-kr.tb-qz-body-kr.mr-b1.tb-mr-b05');
    const totalElement =
      totalParentElement
        .find('strong')
        .filter((i, el) => $(el).text().includes('총'))
        ?.text() || null;
    const numbers = totalElement.replaceAll(',', '').match(/\d+/g);
    // 신청인원이 없는 경우 대응
    if (numbers.length === 1) {
      return {
        recruitCount: Number(numbers[0]),
        applyCount: 0,
      };
    }
    // 대부분 [모집인원, 신청인원, 모집인원] 형식의 배열을 가지고 있다
    if (numbers.length !== 3) return null;

    return {
      // 모집인원
      recruitCount: Number(numbers[0]),
      // 신청인원
      applyCount: Number(numbers[1]),
    };
  }

  /**
   * 캠페인의 태그를 가져온다
   */
  private getCategory($: cheerio.CheerioAPI) {
    const text = $('.qz-badge')
      .filter((i, el) => $(el).attr('title')?.includes('캠페인'))
      .text();
    if (!text) return null;

    switch (text) {
      case '맛집형':
      case '여가생활':
      case '뷰티형':
        return '방문';
      case '배송형':
      case '페이백배송형':
        return '배송';
      case '기자단':
        return '기자단';
      default:
        return '기타';
    }
  }

  private async upsertCampaign(detail: IDinnerQueenParser.GetDetailByIdResult) {
    const { originUrl, title, category, thumbnail, address, recruitCount, applyCount, startedAt, endedAt, drawAt } = detail;
    await this.prismaService.campaign.upsert({
      where: { duplicateId: `DINNER_QUEEN_${detail.id}` },
      create: {
        originUrl,
        title,
        category,
        thumbnail,
        address,
        recruitCount,
        applyCount,
        startedAt,
        endedAt,
        drawAt,
        duplicateId: `DINNER_QUEEN_${detail.id}`,
        resourceProvider: 'DINNER_QUEEN',
        targetPlatforms: 'blog',
      },
      update: {
        originUrl,
        title,
        category,
        thumbnail,
        address,
        recruitCount,
        applyCount,
        startedAt,
        endedAt,
        drawAt,
        duplicateId: `DINNER_QUEEN_${detail.id}`,
        resourceProvider: 'DINNER_QUEEN',
        targetPlatforms: 'blog',
      },
    });
  }
}
