import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ParsingEventService } from './parsing-event.service';
import { PARSING_EVENT_SERVICE } from './type/parsing-event.interface';

@Module({
  imports: [PrismaModule],
  providers: [{ provide: PARSING_EVENT_SERVICE, useClass: ParsingEventService }],
  exports: [PARSING_EVENT_SERVICE],
})
export class ParsingEventModule {}
