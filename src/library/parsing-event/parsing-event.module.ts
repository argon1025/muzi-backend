import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { ParsingEventService } from './parsing-event.service';
import { PARSING_EVENT_SERVICE } from './type/parsing-event.interface';
import { DinnerQueenParser } from './parser/dinner-queen.parser';
import { ParsingEventWorkerBatch } from './parsing-event.batch';
import { DINNER_QUEEN_PARSER } from './parser/type/dinner-queen.parser.interface';
import { CustomLoggerModule } from '../custom-logger/custom-logger.module';
import { SEOULOUBA_PARSER } from './parser/type/seoulouba.parser.interface';
import { SeouloubaParser } from './parser/seoulouba.parser';

@Module({
  imports: [HttpModule, PrismaModule, CustomLoggerModule],
  providers: [
    { provide: PARSING_EVENT_SERVICE, useClass: ParsingEventService },
    { provide: DINNER_QUEEN_PARSER, useClass: DinnerQueenParser },
    { provide: SEOULOUBA_PARSER, useClass: SeouloubaParser },
    ParsingEventWorkerBatch,
  ],
  exports: [PARSING_EVENT_SERVICE],
})
export class ParsingEventModule {}
