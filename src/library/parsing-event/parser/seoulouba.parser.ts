/* eslint-disable @typescript-eslint/no-loop-func */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';
import puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';
import { ParseEventLogger } from '../../custom-logger/parse-event-logger/parse-event.logger';
import { PrismaService } from '../../prisma/prisma.service';
import { ISeouloubaParser } from './type/seoulouba.parser.interface';
import { chunkArray } from '../../utils/chunkArray';

@Injectable()
export class SeouloubaParser implements ISeouloubaParser.Base {
  private readonly NODE_ENV = this.configService.getOrThrow<string>('NODE_ENV');

  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly logger: ParseEventLogger,
    private readonly configService: ConfigService,
  ) {}

  async runWorker(options: ISeouloubaParser.RunWorkerOptions): Promise<ISeouloubaParser.RunWorkerResult> {
    const { postIdList, eventId } = options;
    const chunkSize = 1;
    const requestDelay = 1000; // 상세 정보 요청 후 대기 시간
    this.logger.log(`작업 시작`, 'SeouloubaParser', eventId);

    // SECTION: 요청한 id가 없을 경우 디너퀸 전체 리스트를 가져온다
    const taskList: string[] = postIdList ?? [];
    if (taskList.length === 0) {
      try {
        // 브라우저 부하로 해당 작업은 동시에 실행하지 않는다
        const visitCategory = await this.getAllIdList('https://www.seoulouba.co.kr/campaign/?cat=377');
        const shippingCategory = await this.getAllIdList('https://www.seoulouba.co.kr/campaign/?cat=383');
        const reporterCategory = await this.getAllIdList('https://www.seoulouba.co.kr/campaign/?cat=448');
        const reviewCategory = await this.getAllIdList('https://www.seoulouba.co.kr/campaign/?cat=449');
        // 중복 제거
        taskList.push(...Array.from(new Set([...visitCategory, ...shippingCategory, ...reporterCategory, ...reviewCategory])));
      } catch (error) {
        this.logger.error(`전체 리스트를 가져오는데 실패했습니다`, error, 'SeouloubaParser', eventId);
      }
      this.logger.log(`갱신 대기 리스트 ${taskList.length}개`, 'SeouloubaParser');
    }

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
          this.logger.error(`처리 실패`, failTask.reason, 'SeouloubaParser', eventId);
        });
        break;
      }

      // 대기 시간을 준다
      await setTimeout(requestDelay);
    }

    this.logger.log(
      `작업 종료 총 ${taskList.length}건, 완료 ${successCount}건, 실패 ${failedCount}건, 보류 ${taskList.length - successCount - failedCount}건`,
      'SeouloubaParser',
      eventId,
    );

    return { total: taskList.length, successCount, failedCount };
  }

  async getAllIdList(url: string): Promise<ISeouloubaParser.GetAllIdListResult> {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
      ...(this.NODE_ENV === 'prod' ? { executablePath: '/usr/bin/chromium-browser' } : {}),
    });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 1200000,
    });

    // 모든 캠페인 게시글 로드
    const scrollDelay = 300;
    while (true) {
      // 모집 마감 게시글 체크
      const isRecruitmentClosed = await page.evaluate(() => {
        const element = Array.from(document.querySelectorAll('.load_blind_box strong'));
        return element.some((content) => content.textContent.includes('모집마감'));
      });
      if (isRecruitmentClosed) break;

      // 다음 페이지 선택
      try {
        await page.click('#list_more_btn');
        await page.waitForResponse((response) => {
          return response.url().includes('/campaign/ajax/list.ajax.php') && response.status() === 200;
        });
      } catch (error) {
        break;
      }
      await page.waitForTimeout(scrollDelay); // 지연 시간
    }

    // 페이지 로드가 완료되면 캠페인 id를 추출
    const pageIds = await page.evaluate(() => {
      const links = document.querySelectorAll('.load_campaign a.tum_img');
      const hrefs = Array.from(links)
        .map((link) => link.getAttribute('href'))
        .map((href) => href.match(/c=(\d+)/).pop());
      return hrefs;
    });
    await browser.close();
    return pageIds;
  }

  async getDetailById(id: string): Promise<ISeouloubaParser.GetDetailByIdResult> {
    const requestUrl = `https://www.seoulouba.co.kr/campaign/?c=${id}`;
    const detailResponse = await lastValueFrom(this.httpService.get(requestUrl));

    const $ = cheerio.load(detailResponse.data);

    const title = this.getTitle($);
    const thumbnail = this.getThumbnail($);
    const address = this.getAddress($);
    const category = this.getCategory($);
    const { startedAt, endedAt, drawAt } = this.getDateTime($);
    const { recruitCount, applyCount } = this.getRecruitment($);

    return {
      id,
      title,
      thumbnail,
      address,
      category,
      recruitCount,
      applyCount,
      originUrl: requestUrl,
      startedAt,
      endedAt,
      drawAt,
    };
  }

  /**
   * 캠페인의 제목을 가져온다
   */
  private getTitle($: cheerio.CheerioAPI) {
    return $('h2.tit_v2').text().trim();
  }

  /**
   * 캠페인의 응모 시작일, 응모 종료일, 추첨일을 가져온다
   */
  private getDateTime($: cheerio.CheerioAPI) {
    // 날짜 구문 추출

    const [startedAt, endedAt] = $('.campaign_guide_li .period:eq(0)').text().trim().split(' ~ ');
    const drawAt = $('.campaign_guide_li .period:eq(1)').text().trim();

    return {
      startedAt: DateTime.fromFormat(startedAt, 'yy-MM-dd').minus({ hours: 9 }).toJSDate(),
      endedAt: DateTime.fromFormat(endedAt, 'yy-MM-dd').minus({ hours: 9 }).toJSDate(),
      drawAt: DateTime.fromFormat(drawAt, 'yy-MM-dd').minus({ hours: 9 }).toJSDate(),
    };
  }

  /**
   * 캠페인의 썸네일을 가져온다
   */
  private getThumbnail($: cheerio.CheerioAPI) {
    const imageUrl = $('.thumb.cam_image').css('background');
    return imageUrl.replace(/^url\(['"](.+)['"]\)/, '$1');
  }

  /**
   * 캠페인의 모집인원, 신청인원을 가져온다
   */
  private getRecruitment($: cheerio.CheerioAPI) {
    // "크리에이터"의 값을 파싱
    const creatorText = $('li#cam_apply button.tap_menu_btn span').text();

    // 숫자를 추출
    const regex = /\d+/g;
    const [applyCount, recruitCount] = creatorText.match(regex);

    return {
      recruitCount: Number(recruitCount),
      applyCount: Number(applyCount),
    };
  }

  private getAddress($: cheerio.CheerioAPI): string {
    const address = $('div.map_adress span.txt_short').text();

    return address;
  }

  /**
   * 캠페인의 카테고리를 가져온다
   */
  private getCategory($: cheerio.CheerioAPI) {
    const chTagText = $('.ch_tag').text();
    switch (chTagText) {
      case '방문형': {
        return '방문';
      }
      case '배송형': {
        return '배송';
      }
      case '기자단(배포형)': {
        return '기자단';
      }
      case '서비스형':
      case '구매평플러스':
      case '구매평':
      default: {
        return '기타';
      }
    }
  }

  private async upsertCampaign(detail: ISeouloubaParser.GetDetailByIdResult) {
    const { originUrl, title, category, thumbnail, address, recruitCount, applyCount, startedAt, endedAt, drawAt } = detail;
    await this.prismaService.campaign.upsert({
      where: { duplicateId: `SEOUL_OUBA_${detail.id}` },
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
        duplicateId: `SEOUL_OUBA_${detail.id}`,
        resourceProvider: 'SEOUL_OUBA',
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
        duplicateId: `SEOUL_OUBA_${detail.id}`,
        resourceProvider: 'SEOUL_OUBA',
        targetPlatforms: 'blog',
      },
    });
  }
}
