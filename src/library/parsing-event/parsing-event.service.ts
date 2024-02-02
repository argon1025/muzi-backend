import { Injectable } from '@nestjs/common';
import { ParsingEvent } from '@prisma/client';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { IParsingEventService } from './type/parsing-event.interface';
import { ParsingEventException } from './parsing-event.exception';

@Injectable()
export class ParsingEventService implements IParsingEventService.Base {
  constructor(private readonly prismaService: PrismaService) {}

  async createEvent(options: IParsingEventService.CreateEventOptions): Promise<void> {
    await this.prismaService.$transaction(
      async (prisma) => {
        // 해당 이벤트 타입을 가진 대기, 미처리 이벤트가 있는지 확인
        const existEvent = await prisma.parsingEvent.findFirst({
          where: {
            eventType: options.eventType,
            eventStatus: { in: [IParsingEventService.EventStatus.WAIT, IParsingEventService.EventStatus.PROCESSING] },
          },
        });
        if (existEvent) throw new ParsingEventException('이미 처리중인 이벤트가 존재합니다.', { eventType: options.eventType });

        // 이벤트 생성
        try {
          await prisma.parsingEvent.create({
            data: {
              eventType: options.eventType,
              eventMessage: options.eventMessage,
              eventStatus: IParsingEventService.EventStatus.WAIT,
            },
          });
        } catch (error) {
          throw new ParsingEventException('이벤트 생성에 실패하였습니다.', error);
        }
      },
      // 레이스 컨디션 방지를 위해 Serializable로 설정, Prisma에서는 조건부 유니크 제약을 지원하지 않음
      { isolationLevel: 'Serializable' },
    );
  }

  async getEvent(options: IParsingEventService.GetEventOptions): Promise<IParsingEventService.GetEventResult> {
    const getEventResult = await this.prismaService.$transaction(async (prisma) => {
      // 락을 사용하여 현재 대기중인 이벤트를 조회하고 점유
      const queryResult = await prisma.$queryRaw<ParsingEvent[]>`
      SELECT * FROM "ParsingEvent" WHERE "eventStatus"  = 'WAIT' AND "eventType" =  ${options.eventType} LIMIT 1 FOR UPDATE
      `;
      if (queryResult.length === 0) return null;
      const eventInfo = queryResult.pop();

      // 조회한 이벤트 상태를 처리중으로 변경
      await prisma.parsingEvent.update({
        where: { id: eventInfo.id },
        data: { eventStatus: IParsingEventService.EventStatus.PROCESSING },
      });

      return {
        id: eventInfo.id,
        eventType: eventInfo.eventType as IParsingEventService.EventType,
        eventMessage: eventInfo.eventMessage,
        createdAt: eventInfo.createdAt,
      };
    });

    return getEventResult;
  }

  async modifyEventStatus(options: IParsingEventService.ModifyEventStatusOptions): Promise<void> {
    // 존재하는 이벤트인지 확인
    const existEvent = await this.prismaService.parsingEvent.findFirst({ where: { id: options.eventId } });
    if (!existEvent) throw new ParsingEventException('존재하지 않는 이벤트입니다.', { eventId: options.eventId });

    const isCompleted = options.eventStatus === IParsingEventService.EventStatus.DONE;
    try {
      await this.prismaService.parsingEvent.update({
        where: { id: options.eventId },
        data: {
          eventStatus: options.eventStatus,
          completedAt: isCompleted ? DateTime.utc().toJSDate() : null,
        },
      });
    } catch (error) {
      throw new ParsingEventException('이벤트 상태 변경에 실패하였습니다.', error);
    }
  }

  async createLog(options: IParsingEventService.CreateLogOptions): Promise<void> {
    try {
      await this.prismaService.parsingEventLog.create({
        data: {
          eventId: options.eventId,
          message: options.logMessage,
        },
      });
    } catch (error) {
      throw new ParsingEventException('이벤트 로그 생성에 실패하였습니다.', error);
    }
  }
}
