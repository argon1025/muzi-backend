import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ParseEventLogger } from './parse-event-logger/parse-event.logger';

@Module({
  imports: [PrismaModule],
  providers: [ParseEventLogger],
  exports: [ParseEventLogger],
})
export class CustomLoggerModule {}
