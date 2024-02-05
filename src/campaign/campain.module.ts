import { Module } from '@nestjs/common';
import { PrismaModule } from '../library/prisma/prisma.module';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CAMPAIGN_SERVICE } from './type/campaign.service.interface';
import { JwtUtilityModule } from '../library/jwt-utility/jwt-utility.module';

@Module({
  imports: [PrismaModule, JwtUtilityModule],
  controllers: [CampaignController],
  providers: [{ provide: CAMPAIGN_SERVICE, useClass: CampaignService }],
})
export class CampaignModule {}
