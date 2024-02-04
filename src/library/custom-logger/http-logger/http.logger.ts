import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';

@Injectable()
export class HttpLogger extends ConsoleLogger {
  log(message: string, context?: string) {
    const kstTime = DateTime.utc().plus({ hours: 9 }).toISO();
    console.log(`${kstTime} - [${context}] ${message}`);
  }

  error(message: string, error: any, context?: string) {
    const kstTime = DateTime.utc().plus({ hours: 9 }).toISO();
    console.error(`${kstTime} - [${context}] ${message}`);

    if (error) {
      switch (true) {
        case error instanceof AxiosError: {
          console.error({ request: error.config, response: error.response?.data });
          break;
        }
        default: {
          console.error(error);
          break;
        }
      }
    }
  }
}
