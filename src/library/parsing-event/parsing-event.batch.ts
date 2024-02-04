import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ParseEventLogger } from '../custom-logger/parse-event-logger/parse-event.logger';
import { PARSING_EVENT_SERVICE, IParsingEventService } from './type/parsing-event.interface';
import { DINNER_QUEEN_PARSER, IDinnerQueenParser } from './parser/type/dinner-queen.parser.interface';

@Injectable()
export class ParsingEventWorkerBatch {
  private hasRunning = false;

  constructor(
    @Inject(PARSING_EVENT_SERVICE)
    private readonly parsingEventService: IParsingEventService.Base,
    @Inject(DINNER_QUEEN_PARSER)
    private readonly dinnerQueenParser: IDinnerQueenParser.Base,
    private readonly logger: ParseEventLogger,
  ) {}

  /**
   * 5시간 주기로 파싱 이벤트 생성
   */
  @Cron(CronExpression.EVERY_5_HOURS)
  async parseRequestWorker() {
    // SECTION: 이벤트 생성
    await this.parsingEventService.createEvent({
      eventType: IParsingEventService.EventType.DINNER_QUEEN,
      eventMessage: ' ',
    });
  }

  /**
   * 파싱 이벤트 처리기
   * 실행 주기 : 5초마다
   * 역할 : 이벤트를 폴링하여 올바른 워커에게 이벤트를 전달합니다
   * 리소스 문제로 이미 실행중인 작업이 있을 경우 추가 실행하지 않습니다
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async parseEventWorker() {
    if (this.hasRunning) return;
    this.logger.log(`이벤트 처리기 실행`, 'parseEventWorker');

    // SECTION: 처리할 이벤트가 존재하는지 확인
    const event = await this.parsingEventService.getEvent({});
    if (!event) return;

    // SECTION: 이벤트 타입에 따라 워커를 실행
    this.hasRunning = true;
    let eventResult: IDinnerQueenParser.RunWorkerResult = { total: 0, successCount: 0, failedCount: 0 };
    switch (event.eventType) {
      case IParsingEventService.EventType.DINNER_QUEEN: {
        eventResult = await this.dinnerQueenParser.runWorker({ eventId: event.id });
        break;
      }
      default: {
        this.logger.error(`지원하지 않는 이벤트 타입입니다`, event, 'parseEventWorker', event.id);
        eventResult.total = 1;
        break;
      }
    }

    // SECTION: 이벤트 처리 결과를 저장
    const isFailed = eventResult.total !== eventResult.successCount;
    await this.parsingEventService.modifyEventStatus({
      eventId: event.id,
      eventStatus: isFailed ? IParsingEventService.EventStatus.FAIL : IParsingEventService.EventStatus.DONE,
    });

    this.hasRunning = false;
  }
}