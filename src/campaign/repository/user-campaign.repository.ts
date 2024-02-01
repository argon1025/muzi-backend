import { Injectable } from '@nestjs/common';

import { DateTime } from 'luxon';
import { PrismaService } from '../../library/prisma/prisma.service';
import { IUserCampaignRepository } from '../type/user-campaign.repository.interface';

@Injectable()
export class UserCampaignRepository implements IUserCampaignRepository.Base {
  constructor(private readonly prismaService: PrismaService) {}

  findOneByUserIdAndCampaignId(
    options: IUserCampaignRepository.FindOneByUserIdAndCampaignIdOptions,
  ): Promise<IUserCampaignRepository.FindOneByUserIdAndCampaignIdResult> {
    const { userId, campaignId } = options;
    return this.prismaService.userCampaign.findFirst({
      select: {
        id: true,
        userId: true,
        campaignDetail: true,
      },
      where: {
        userId,
        campaignId,
        deletedAt: null,
        campaignDetail: {
          deletedAt: null,
        },
      },
    });
  }

  async findOneById(options: IUserCampaignRepository.FindOneByIdOptions): Promise<IUserCampaignRepository.FindOneByIdResult> {
    const { id } = options;
    return this.prismaService.userCampaign.findFirst({
      select: {
        id: true,
        userId: true,
        campaignDetail: true,
      },
      where: {
        id,
        deletedAt: null,
        campaignDetail: {
          deletedAt: null,
        },
      },
    });
  }

  async findMany(options: IUserCampaignRepository.FindManyOptions): Promise<IUserCampaignRepository.FindManyResult> {
    const { userId, campaignId, size, page } = options;
    const list = await this.prismaService.userCampaign.findMany({
      select: {
        campaignDetail: true,
        id: true,
      },
      where: {
        userId,
        campaignId,
        deletedAt: null,
        campaignDetail: {
          deletedAt: null,
        },
      },
      skip: size * (page - 1),
      take: size,
    });
    const total = await this.prismaService.userCampaign.count({ where: { userId } });

    return {
      list,
      total,
    };
  }

  async create(options: IUserCampaignRepository.CreateOptions): Promise<void> {
    const { userId, campaignId } = options;

    await this.prismaService.userCampaign.create({
      data: {
        userId,
        campaignId,
      },
    });
  }

  async delete(options: IUserCampaignRepository.DeleteOptions): Promise<void> {
    const { id } = options;
    await this.prismaService.userCampaign.update({
      where: { id },
      data: {
        deletedAt: DateTime.utc().toJSDate(),
      },
    });
  }
}
