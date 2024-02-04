import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ParseEventLogger } from './parse-event-logger/parse-event.logger';
import { HttpLogger } from './http-logger/http.logger';

@Module({
  imports: [PrismaModule],
  providers: [ParseEventLogger, HttpLogger],
  exports: [ParseEventLogger, HttpLogger],
})
export class CustomLoggerModule {}
