import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { ICampaignService } from './type/campaign.service.interface';
import { ERROR_CODE } from '../library/exception/error.constant';
import { PrismaService } from '../library/prisma/prisma.service';

@Injectable()
export class CampaignService implements ICampaignService.Base {
  constructor(private readonly prismaService: PrismaService) {
    this.findMany({ size: 10, page: 1 });
  }

  /**
   * 전체 캠페인 목록을 조회합니다.
   */
  async findMany(options: ICampaignService.FindManyOptions): Promise<ICampaignService.FindManyResult> {
    const { title, address, category, hasAvailable, size, page } = options;
    const whereQuery = {
      title: {
        contains: title,
      },
      address: {
        contains: address,
      },
      category: {
        contains: category,
      },
      ...(hasAvailable && {
        startedAt: {
          lte: DateTime.utc().toJSDate(),
        },
        endedAt: {
          gte: DateTime.utc().toJSDate(),
        },
      }),
      deletedAt: null,
    };

    const list = await this.prismaService.campaign.findMany({
      where: whereQuery,
      orderBy: { endedAt: 'desc' },
      take: size,
      skip: size * (page - 1),
    });
    const total = await this.prismaService.campaign.count({ where: whereQuery });

    return {
      list,
      total,
    };
  }

  /**
   * 특정 사용자가 즐겨찾기한 캠페인 목록을 조회합니다.
   */
  async findManyUserCampaign(options: ICampaignService.FindManyUserCampaignOptions): Promise<ICampaignService.FindManyUserCampaignResult> {
    const { userId, size, page } = options;
    const queryOption = {
      select: {
        campaignDetail: true,
        id: true,
      },
      where: {
        userId,
        deletedAt: null,
        campaignDetail: {
          deletedAt: null,
        },
      },
      skip: size * (page - 1),
      take: size,
    };
    const list = await this.prismaService.userCampaign.findMany(queryOption);
    const total = await this.prismaService.userCampaign.count({ where: queryOption.where });

    return {
      list,
      total,
    };
  }

  /**
   * 캠페인 즐겨찾기를 추가합니다.
   */
  async createUserCampaign(options: ICampaignService.CreateUserCampaignOptions): Promise<void> {
    const { userId, campaignId } = options;

    // 존재하는 캠페인인지 확인
    const campaign = await this.prismaService.campaign.findFirst({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException(ERROR_CODE.CAMPAIGN_NOT_FOUND);
    }

    // 이미 즐겨찾기에 추가된 캠페인인지 확인
    const userCampaign = await this.prismaService.userCampaign.findFirst({
      where: {
        userId,
        campaignId,
        deletedAt: null,
        campaignDetail: {
          deletedAt: null,
        },
      },
    });
    if (userCampaign) {
      throw new BadRequestException(ERROR_CODE.CAMPAIGN_ALREADY_EXIST);
    }

    // 즐겨찾기 추가
    await this.prismaService.userCampaign.create({
      data: {
        userId,
        campaignId,
      },
    });
  }

  /**
   * 캠페인 즐겨찾기를 삭제합니다.
   */
  async deleteUserCampaign(options: ICampaignService.DeleteUserCampaignOptions): Promise<void> {
    const { userId, id } = options;
    // 존재하는 즐겨찾기인지 확인
    const userCampaign = await this.prismaService.userCampaign.findFirst({
      where: {
        id,
        deletedAt: null,
        campaignDetail: {
          deletedAt: null,
        },
      },
    });
    if (!userCampaign) {
      throw new NotFoundException(ERROR_CODE.USER_CAMPAIGN_NOT_FOUND);
    }
    // 사용자 유효성 확인
    if (userCampaign.userId !== userId) {
      throw new ForbiddenException(ERROR_CODE.USER_CAMPAIGN_NOT_AUTHORIZED);
    }

    // 즐겨찾기 삭제
    await this.prismaService.userCampaign.update({
      where: { id },
      data: {
        deletedAt: DateTime.utc().toJSDate(),
      },
    });
  }
}
