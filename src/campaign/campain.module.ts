import { Module } from '@nestjs/common';
import { PrismaModule } from '../library/prisma/prisma.module';
import { CampaignController } from './campaign.controller';
import { CAMPAIGN_REPOSITORY } from './type/campaign.repository.interface';
import { CampaignService } from './campaign.service';
import { CampaignRepository } from './repository/campaign.repository';
import { UserCampaignRepository } from './repository/user-campaign.repository';
import { CAMPAIGN_SERVICE } from './type/campaign.service.interface';
import { USER_CAMPAIGN_REPOSITORY } from './type/user-campaign.repository.interface';
import { JwtUtilityModule } from '../library/jwt-utility/jwt-utility.module';

@Module({
  imports: [PrismaModule, JwtUtilityModule],
  controllers: [CampaignController],
  providers: [
    { provide: CAMPAIGN_REPOSITORY, useClass: CampaignRepository },
    { provide: USER_CAMPAIGN_REPOSITORY, useClass: UserCampaignRepository },
    { provide: CAMPAIGN_SERVICE, useClass: CampaignService },
  ],
})
export class CampaignModule {}
