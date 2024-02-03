import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';

@Injectable()
export class DinnerQueenParser {
  constructor(private readonly httpService: HttpService) {}

  /**
   * 현재 진행중인 모든 캠페인 리스트를 가져온다
   */
  async getAllList() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const scrollDelay = 300;
    await page.goto('https://dinnerqueen.net/taste', { waitUntil: 'domcontentloaded', timeout: 600000 });

    let lastHeight = await page.evaluate('document.body.scrollHeight');
    while (true) {
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      // 조건부 대기를 추가하여 실제로 스크롤이 발생했는지 확인
      try {
        await page.waitForFunction(`document.body.scrollHeight > ${lastHeight}`, { timeout: 10000 });
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
      const hrefs = Array.from(links).map((link) => link.getAttribute('href').split('/')[1]); // 각 링크의 href 속성 추출
      return hrefs; // 추출된 href 배열 반환
    });

    await browser.close();
    return pageIds;
  }

  /**
   * 캠페인의 상세 정보를 가져온다
   */
  async getDetailById(id: string) {
    const detailResponse = await lastValueFrom(this.httpService.get(`https://dinnerqueen.net/taste/${id}`));
    const $ = cheerio.load(detailResponse.data);

    const title = this.getTitle($);
    const campaignDates = this.getDateTime($);
    const thumbnail = this.getThumbnail($);
    const location = this.getLocations($);
    const recruitment = this.getRecruitment($);
    const tags = this.getTags($);
    return { title, campaignDates, thumbnail, location, recruitment, tags };
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
      startedAt: DateTime.fromFormat(campaignDates[0].trim(), 'yy.MM.dd').toJSDate(),
      // 응모 종료일
      endedAt: DateTime.fromFormat(campaignDates[1].trim(), 'yy.MM.dd').toJSDate(),
      // 추첨일
      drawAt: DateTime.fromFormat(drawDateString, 'yy.MM.dd').toJSDate(),
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
  private getLocations($: cheerio.CheerioAPI) {
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
    // [모집인원, 신청인원, 모집인원] 형식의 배열을 가지고 있다
    if (numbers.length !== 3) return null;

    return {
      // 모집인원
      total: Number(numbers[0]),
      // 신청인원
      applied: Number(numbers[1]),
    };
  }

  /**
   * 캠페인의 태그를 가져온다
   */
  private getTags($: cheerio.CheerioAPI) {
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
}
