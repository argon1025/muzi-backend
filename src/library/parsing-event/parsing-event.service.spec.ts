import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ParsingEventService } from './parsing-event.service';
import { IParsingEventService } from './type/parsing-event.interface';

describe('ParsingEventService', () => {
  let parsingEventService: ParsingEventService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParsingEventService, PrismaService],
    }).compile();

    parsingEventService = module.get<ParsingEventService>(ParsingEventService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prismaService.$transaction([prismaService.parsingEvent.deleteMany(), prismaService.parsingEventLog.deleteMany()]);
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('createEvent', () => {
    it('등록하고자 하는 이벤트 타입이 대기, 처리중인 내역이 없을경우 등록할 수 있다.', async () => {
      // given
      const eventType = IParsingEventService.EventType.DINNER_QUEEN_ALL_PAGE;
      const eventMessage = '테스트';
      // 처리 완료된 이벤트를 한번 등록
      await prismaService.parsingEvent.create({
        data: {
          eventType,
          eventMessage,
          eventStatus: IParsingEventService.EventStatus.DONE,
        },
      });

      // when
      await parsingEventService.createEvent({ eventType, eventMessage });

      // then
      expect((await prismaService.parsingEvent.findMany()).length).toBe(2);
    });

    it('등록하고자 하는 이벤트 타입이 이미 대기, 처리중인 경우 추가로 등록할 수 없다', async () => {
      // given
      const eventType = IParsingEventService.EventType.DINNER_QUEEN_ALL_PAGE;
      const eventMessage = '레이스 컨디션 테스트';

      // when
      // 정확한 테스트를 위해서는 createEvent select 이후 대기시간을 두어야 한다.
      await Promise.allSettled([
        parsingEventService.createEvent({ eventType, eventMessage }),
        parsingEventService.createEvent({ eventType, eventMessage }),
        parsingEventService.createEvent({ eventType, eventMessage }),
        parsingEventService.createEvent({ eventType, eventMessage }),
        parsingEventService.createEvent({ eventType, eventMessage }),
      ]);

      // then
      // 동일한 이벤트 타입으로 대기중인 이벤트는 하나만 존재해야 한다
      expect((await prismaService.parsingEvent.findMany()).length).toBe(1);
    });

    it('동일한 타입의 이벤트가 있을 경우 이벤트 생성에 실패한다', async () => {
      // given
      const eventType = IParsingEventService.EventType.DINNER_QUEEN_ALL_PAGE;
      const eventMessage = '테스트';
      await parsingEventService.createEvent({ eventType, eventMessage });

      // when
      const result = parsingEventService.createEvent({ eventType, eventMessage });

      // then
      await expect(result).rejects.toThrow('이미 처리중인 이벤트가 존재합니다.');
    });
  });

  describe('getEvent', () => {
    it('대기중인 이벤트가 없을 경우 null을 반환한다', async () => {
      // given
      const eventType = IParsingEventService.EventType.DINNER_QUEEN_ALL_PAGE;

      // when
      const result = await parsingEventService.getEvent({ eventType });

      // then
      expect(result).toBeNull();
    });

    it('대기중인 이벤트가 있을 경우 이벤트를 반환하고 상태를 처리중으로 변경한다.', async () => {
      // given
      const eventType = IParsingEventService.EventType.DINNER_QUEEN_ALL_PAGE;
      const eventMessage = '테스트';
      await prismaService.parsingEvent.create({ data: { eventType, eventMessage, eventStatus: IParsingEventService.EventStatus.WAIT } });

      // when
      const result = await parsingEventService.getEvent({ eventType });

      // then
      expect(result).toHaveProperty(['eventType'], eventType);
      // 상태가 처리중으로 변경되었는지 확인
      const eventResult = await prismaService.parsingEvent.findFirst();
      expect(eventResult.eventStatus).toBe(IParsingEventService.EventStatus.PROCESSING);
    });
    it('동일한 이벤트 중복 응답 방지 검증', async () => {
      // given
      const eventType = IParsingEventService.EventType.DINNER_QUEEN_ALL_PAGE;
      const eventMessage = '테스트';
      await prismaService.parsingEvent.create({ data: { eventType, eventMessage, eventStatus: IParsingEventService.EventStatus.WAIT } });

      // when
      const result = await Promise.all([
        parsingEventService.getEvent({ eventType }),
        parsingEventService.getEvent({ eventType }),
        parsingEventService.getEvent({ eventType }),
        parsingEventService.getEvent({ eventType }),
      ]);

      // then
      // 동일한 이벤트에 대해서는 하나의 응답만 처리되어야 한다.
      expect(result.filter((item) => item !== null).length).toBe(1);
    });
  });

  describe('modifyEventStatus', () => {
    it('이벤트 상태를 변경할 수 있다.', async () => {
      // given
      const eventType = IParsingEventService.EventType.DINNER_QUEEN_ALL_PAGE;
      const eventMessage = '테스트';
      const event = await prismaService.parsingEvent.create({
        data: { eventType, eventMessage, eventStatus: IParsingEventService.EventStatus.WAIT },
      });

      // when
      await parsingEventService.modifyEventStatus({ eventId: event.id, eventStatus: IParsingEventService.EventStatus.FAIL });

      // then
      const eventResult = await prismaService.parsingEvent.findFirst();
      expect(eventResult.eventStatus).toBe(IParsingEventService.EventStatus.FAIL);
    });

    it('존재하지 않는 이벤트에 대해서는 상태 변경에 실패한다', async () => {
      // given
      const eventId = 'nono-event-id';
      const eventStatus = IParsingEventService.EventStatus.DONE;

      // when
      const result = parsingEventService.modifyEventStatus({ eventId, eventStatus });

      // then
      await expect(result).rejects.toThrow('존재하지 않는 이벤트입니다.');
    });

    it('완료 상태로 변경할 경우 완료 시각을 기록한다.', async () => {
      // given
      const eventType = IParsingEventService.EventType.DINNER_QUEEN_ALL_PAGE;
      const eventMessage = '테스트';
      const event = await prismaService.parsingEvent.create({
        data: { eventType, eventMessage, eventStatus: IParsingEventService.EventStatus.WAIT },
      });

      // when
      await parsingEventService.modifyEventStatus({ eventId: event.id, eventStatus: IParsingEventService.EventStatus.DONE });

      // then
      const eventResult = await prismaService.parsingEvent.findFirst();
      expect(eventResult.completedAt).not.toBeNull();
    });
  });

  describe('createLog', () => {
    it('이벤트 로그를 생성할 수 있다.', async () => {
      // given & when
      await parsingEventService.createLog({ eventId: 'eventId', logMessage: '테스트 로그' });

      // then
      const eventLogResult = await prismaService.parsingEventLog.findFirst();
      expect(eventLogResult.eventId).toBe('eventId');
    });
  });
});
