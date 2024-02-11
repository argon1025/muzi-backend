import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { ICampaignService } from './type/campaign.service.interface';
import { ERROR_CODE } from '../library/exception/error.constant';
import { PrismaService } from '../library/prisma/prisma.service';
import { IParsingEventService, PARSING_EVENT_SERVICE } from '../library/parsing-event/type/parsing-event.interface';
import { ParsingEventException } from '../library/parsing-event/parsing-event.exception';

@Injectable()
export class CampaignService implements ICampaignService.Base {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(PARSING_EVENT_SERVICE)
    private readonly parsingEventService: IParsingEventService.Base,
  ) {
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

  /**
   * 특정 캠페인을 최신상태로 업데이트 요청 이벤트를 생성합니다.
   */
  async createUpdateRequestEvent(options: ICampaignService.CreateUpdateRequestEventOptions): Promise<void> {
    // 존재하는 캠페인인지 확인
    const campaign = await this.prismaService.campaign.findFirst({ where: { id: options.id } });
    if (!campaign) {
      throw new NotFoundException(ERROR_CODE.CAMPAIGN_NOT_FOUND);
    }

    // 업데이트 요청이 지원되는 캠페인 타입인지 확인
    let eventType: IParsingEventService.EventType;
    try {
      eventType = this.parsingEventService.getEventTypeFromText(campaign.resourceProvider);
    } catch (_) {
      throw new BadRequestException(ERROR_CODE.CAMPAIGN_TYPE_NOT_ALLOWED);
    }

    // 종료된 캠페인인지 확인
    const isEnded = campaign.endedAt && campaign.endedAt <= DateTime.utc().toJSDate();
    if (isEnded) {
      throw new BadRequestException(ERROR_CODE.CAMPAIGN_ALREADY_ENDED);
    }

    // 업데이트 요청 이벤트 생성
    try {
      const targetId = campaign.duplicateId.replaceAll(`${eventType}_`, '');
      await this.parsingEventService.createEvent({
        eventType,
        eventMessage: {
          requestType: 'UPDATE',
          targetId,
        },
      });
    } catch (error) {
      if (error instanceof ParsingEventException) {
        switch (error.getErrorMessage()) {
          case '이미 처리중인 이벤트가 존재합니다.':
            return;
          default:
            break;
        }
      }
      Logger.error('캠페인 업데이트 요청 실패', error, 'createUpdateRequestEvent');
      throw new InternalServerErrorException(ERROR_CODE.CAMPAIGN_UPDATE_REQUEST_FAILED);
    }
  }
}
