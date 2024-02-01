import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../library/prisma/prisma.service';
import { ICampaignRepository } from '../type/campaign.repository.interface';

@Injectable()
export class CampaignRepository implements ICampaignRepository.Base {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany(options: ICampaignRepository.FindManyOptions): Promise<ICampaignRepository.FindManyResult> {
    const { title, city, size, page } = options;
    const list = await this.prismaService.campaign.findMany({
      where: {
        title: {
          contains: title,
        },
        city: {
          contains: city,
        },
        deletedAt: null,
      },
      take: size,
      skip: size * (page - 1),
    });
    const total = await this.prismaService.campaign.count({
      where: {
        title: {
          contains: title,
        },
        city: {
          contains: city,
        },
        deletedAt: null,
      },
    });

    return {
      list: list.map((item) => ({
        id: item.id,
        resourceProvider: item.resourceProvider,
        targetPlatforms: item.targetPlatforms,
        category: item.category,
        title: item.title,
        thumbnail: item.thumbnail,
        city: item.city,
        startedAt: item.startedAt,
        endedAt: item.endedAt,
        drawAt: item.drawAt,
        updatedAt: item.updatedAt,
        createdAt: item.createdAt,
      })),
      total,
    };
  }

  async findOne(id: string): Promise<ICampaignRepository.FindOneResult> {
    const campaign = await this.prismaService.campaign.findFirst({ where: { id } });
    return campaign;
  }
}
