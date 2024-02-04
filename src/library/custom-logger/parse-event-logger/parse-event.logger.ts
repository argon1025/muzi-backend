import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 파싱 이벤트 처리기 로거
 */
@Injectable()
export class ParseEventLogger extends ConsoleLogger {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  log(message: string, context?: string, eventId?: string) {
    console.log(`[${context}] ${message}`);
    if (eventId) {
      this.saveLog(eventId, message);
    }
  }

  error(message: string, error: any, context?: string, eventId?: string) {
    console.error(`[${context}] ${message}`, error);

    if (!eventId || !error) {
      return;
    }

    switch (true) {
      case error instanceof AxiosError: {
        this.saveLog(eventId, `request: ${JSON.stringify(error.config)} response: ${JSON.stringify(error.response?.data)}`);
        break;
      }
      default: {
        this.saveLog(eventId, JSON.stringify(error));
        break;
      }
    }
  }

  private async saveLog(eventId: string, message: string) {
    try {
      await this.prismaService.parsingEventLog.create({
        data: {
          eventId,
          message,
        },
      });
    } catch (error) {
      console.error(`[saveLog] 로그 저장에 실패했습니다`, error);
    }
  }
}
