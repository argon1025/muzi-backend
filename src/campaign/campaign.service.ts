import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICampaignService } from './type/campaign.service.interface';
import { CAMPAIGN_REPOSITORY, ICampaignRepository } from './type/campaign.repository.interface';
import { IUserCampaignRepository, USER_CAMPAIGN_REPOSITORY } from './type/user-campaign.repository.interface';
import { ERROR_CODE } from '../library/exception/error.constant';

@Injectable()
export class CampaignService implements ICampaignService.Base {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository.Base,
    @Inject(USER_CAMPAIGN_REPOSITORY)
    private readonly userCampaignRepository: IUserCampaignRepository.Base,
  ) {}

  /**
   * 전체 캠페인 목록을 조회합니다.
   */
  findMany(options: ICampaignService.FindManyOptions): Promise<ICampaignService.FindManyResult> {
    return this.campaignRepository.findMany(options);
  }

  /**
   * 특정 사용자가 즐겨찾기한 캠페인 목록을 조회합니다.
   */
  findManyUserCampaign(options: ICampaignService.FindManyUserCampaignOptions): Promise<ICampaignService.FindManyUserCampaignResult> {
    return this.userCampaignRepository.findMany(options);
  }

  /**
   * 캠페인 즐겨찾기를 추가합니다.
   */
  async createUserCampaign(options: ICampaignService.CreateUserCampaignOptions): Promise<void> {
    const { userId, campaignId } = options;

    // 존재하는 캠페인인지 확인
    const campaign = await this.campaignRepository.findOne(campaignId);
    if (!campaign) {
      throw new NotFoundException(ERROR_CODE.CAMPAIGN_NOT_FOUND);
    }

    // 이미 즐겨찾기에 추가된 캠페인인지 확인
    const userCampaign = await this.userCampaignRepository.findOneByUserIdAndCampaignId({ userId, campaignId });
    if (userCampaign) {
      throw new BadRequestException(ERROR_CODE.CAMPAIGN_ALREADY_EXIST);
    }

    // 즐겨찾기 추가
    await this.userCampaignRepository.create({ userId, campaignId });
  }

  /**
   * 캠페인 즐겨찾기를 삭제합니다.
   */
  async deleteUserCampaign(options: ICampaignService.DeleteUserCampaignOptions): Promise<void> {
    const { userId, id } = options;
    // 존재하는 즐겨찾기인지 확인
    const userCampaign = await this.userCampaignRepository.findOneById({ id });
    if (!userCampaign) {
      throw new NotFoundException(ERROR_CODE.USER_CAMPAIGN_NOT_FOUND);
    }
    // 사용자 유효성 확인
    if (userCampaign.userId !== userId) {
      throw new ForbiddenException(ERROR_CODE.USER_CAMPAIGN_NOT_AUTHORIZED);
    }

    // 즐겨찾기 삭제
    await this.userCampaignRepository.delete(options);
  }
}
