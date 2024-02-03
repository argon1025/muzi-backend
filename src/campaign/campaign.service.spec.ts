import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CampaignService } from './campaign.service';
import { CAMPAIGN_REPOSITORY } from './type/campaign.repository.interface';
import { CampaignRepository } from './repository/campaign.repository';
import { USER_CAMPAIGN_REPOSITORY } from './type/user-campaign.repository.interface';
import { UserCampaignRepository } from './repository/user-campaign.repository';
import { PrismaService } from '../library/prisma/prisma.service';
import { ERROR_CODE } from '../library/exception/error.constant';

describe('CampaignService', () => {
  let campaignService: CampaignService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        { provide: CAMPAIGN_REPOSITORY, useClass: CampaignRepository },
        { provide: USER_CAMPAIGN_REPOSITORY, useClass: UserCampaignRepository },
        PrismaService,
      ],
    }).compile();

    campaignService = module.get<CampaignService>(CampaignService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prismaService.$transaction([prismaService.userCampaign.deleteMany(), prismaService.campaign.deleteMany(), prismaService.user.deleteMany()]);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('findMany', () => {
    it('조건에 맞는 캠페인을 찾고 결과를 리턴한다.', async () => {
      // given
      // 시간 고정
      const fakeNowTime = DateTime.fromISO('2023-01-01T08:00:00Z').toJSDate(); // utc 기준
      // 캠페인 데이터 2건 등록
      const campaignList = [
        {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: fakeNowTime,
          createdAt: fakeNowTime,
        },
        {
          id: 'campaign2',
          duplicateId: 'duplicateId2',
          resourceProvider: 'resourceProvider2',
          originUrl: 'originUrl2',
          title: 'title2',
          category: 'category2',
          targetPlatforms: 'targetPlatforms2',
          thumbnail: 'thumbnail2',
          address: 'address2',
          recruitCount: 2,
          applyCount: 2,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: fakeNowTime,
          createdAt: fakeNowTime,
        },
      ];
      await prismaService.campaign.createMany({ data: campaignList });

      // when
      const result = await campaignService.findMany({ address: 'address1', size: 10, page: 1 });

      // then
      expect(result.list.length).toBe(1);
      expect(result.list[0].id).toBe('campaign1');
      expect(result.total).toBe(1);
    });
    it('조건에 맞지 않는 캠페인은 목록에서 제외한다.', async () => {
      // given
      // 시간 고정
      const fakeNowTime = DateTime.fromISO('2023-01-01T08:00:00Z').toJSDate(); // utc 기준
      // 캠페인 데이터 2건 등록
      const campaignList = [
        {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: fakeNowTime,
          createdAt: fakeNowTime,
        },
        {
          id: 'campaign2',
          duplicateId: 'duplicateId2',
          resourceProvider: 'resourceProvider2',
          originUrl: 'originUrl2',
          title: 'title2',
          category: 'category2',
          targetPlatforms: 'targetPlatforms2',
          thumbnail: 'thumbnail2',
          address: 'address2',
          recruitCount: 2,
          applyCount: 2,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: fakeNowTime,
          createdAt: fakeNowTime,
        },
      ];
      await prismaService.campaign.createMany({ data: campaignList });

      // when
      const result = await campaignService.findMany({ address: 'address1', title: 'title2', size: 10, page: 1 });

      // then
      expect(result).toEqual({ list: [], total: 0 });
    });
    it('삭제된 캠페인은 목록에서 제외한다', async () => {
      // given
      // 삭제된 캠페인 데이터 2건 등록
      const campaignList = [
        {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: new Date(),
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 'campaign2',
          duplicateId: 'duplicateId2',
          resourceProvider: 'resourceProvider2',
          originUrl: 'originUrl2',
          title: 'title2',
          category: 'category2',
          targetPlatforms: 'targetPlatforms2',
          thumbnail: 'thumbnail2',
          address: 'address2',
          recruitCount: 2,
          applyCount: 2,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: new Date(),
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      await prismaService.campaign.createMany({ data: campaignList });

      // when
      const result = await campaignService.findMany({ size: 10, page: 1 });

      // then
      expect(result).toEqual({ list: [], total: 0 });
    });
  });

  describe('findManyUserCampaign', () => {
    it('캠페인을 찾고 결과를 리턴한다.', async () => {
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });
      await prismaService.user.create({
        data: {
          id: 'user1',
          provider: 'provider',
          nickname: 'user1',
        },
      });
      await prismaService.userCampaign.create({
        data: {
          userId: 'user1',
          campaignId: 'campaign1',
        },
      });

      // when
      const result = await campaignService.findManyUserCampaign({ userId: 'user1', size: 10, page: 1 });

      // then
      expect(result.list.length).toBe(1);
      expect(result.list[0].campaignDetail.id).toBe('campaign1');
      expect(result.total).toBe(1);
    });
    it('조건에 맞지 않는 캠페인은 목록에서 제외한다.', async () => {
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });
      await prismaService.user.create({
        data: {
          id: 'user1',
          provider: 'provider',
          nickname: 'user1',
        },
      });
      await prismaService.userCampaign.create({
        data: {
          userId: 'user1',
          campaignId: 'campaign1',
        },
      });

      // when
      const result = await campaignService.findManyUserCampaign({ userId: 'user2', size: 10, page: 1 });

      // then
      expect(result.list.length).toBe(0);
      expect(result.total).toBe(0);
    });
    it('삭제된 캠페인이 존재할 경우 목록에서 제외한다', async () => {
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: new Date(),
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });
      await prismaService.user.create({
        data: {
          id: 'user1',
          provider: 'provider',
          nickname: 'user1',
        },
      });
      await prismaService.userCampaign.create({
        data: {
          userId: 'user1',
          campaignId: 'campaign1',
        },
      });

      // when
      const result = await campaignService.findManyUserCampaign({ userId: 'user1', size: 10, page: 1 });

      // then
      expect(result.list.length).toBe(0);
      expect(result.total).toBe(0);
    });
    it('삭제된 즐겨찾기는 목록에서 제외한다', async () => {
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });
      await prismaService.user.create({
        data: {
          id: 'user1',
          provider: 'provider',
          nickname: 'user1',
        },
      });
      await prismaService.userCampaign.create({
        data: {
          userId: 'user1',
          campaignId: 'campaign1',
          deletedAt: new Date(), // 삭제된 즐겨찾기 데이터
        },
      });

      // when
      const result = await campaignService.findManyUserCampaign({ userId: 'user1', size: 10, page: 1 });

      // then
      expect(result.list.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('createUserCampaign', () => {
    it('존재하지 않는 캠페인인 경우 BadRequestException을 던진다.', async () => {
      // given
      // 캠페인 데이터를 설정하지 않는다

      // when
      const result = campaignService.createUserCampaign({ userId: '1', campaignId: '1' });

      // then
      await expect(result).rejects.toThrow(new NotFoundException(ERROR_CODE.CAMPAIGN_NOT_FOUND));
    });

    it('이미 즐겨찾기에 추가된 캠페인인 경우 BadRequestException을 던진다.', async () => {
      // given
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });
      await prismaService.user.create({
        data: {
          id: 'user1',
          provider: 'provider',
          nickname: 'user1',
        },
      });
      await prismaService.userCampaign.create({
        data: {
          userId: 'user1',
          campaignId: 'campaign1',
        },
      });

      // when
      const result = campaignService.createUserCampaign({ userId: 'user1', campaignId: 'campaign1' });

      // then
      await expect(result).rejects.toThrow(new NotFoundException(ERROR_CODE.CAMPAIGN_ALREADY_EXIST));
    });

    it('정상적으로 즐겨찾기를 추가한다.', async () => {
      // given
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });
      await prismaService.user.create({
        data: {
          id: 'user1',
          provider: 'provider',
          nickname: 'user1',
        },
      });

      // when
      await campaignService.createUserCampaign({ userId: 'user1', campaignId: 'campaign1' });

      // then
      const userCampaign = await prismaService.userCampaign.findMany();
      expect(userCampaign).toHaveLength(1);
    });
  });

  describe('deleteUserCampaign', () => {
    it('존재하지 않는 즐겨찾기인 경우 NotFoundException을 던진다.', async () => {
      // given
      // 즐겨찾기 데이터를 설정하지 않는다

      // when
      const result = campaignService.deleteUserCampaign({ userId: '1', id: '1' });

      // then
      await expect(result).rejects.toThrow(new NotFoundException(ERROR_CODE.USER_CAMPAIGN_NOT_FOUND));
    });
    it('사용자가 즐겨찾기한 캠페인이 아닌 경우 ForbiddenException을 던진다.', async () => {
      // given
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });
      await prismaService.user.create({
        data: {
          id: 'user1',
          provider: 'provider',
          nickname: 'user1',
        },
      });
      await prismaService.userCampaign.create({
        data: {
          id: 'userCampaign1',
          userId: 'user1',
          campaignId: 'campaign1',
        },
      });

      // when
      const result = campaignService.deleteUserCampaign({ userId: 'user2', id: 'userCampaign1' });

      // then
      await expect(result).rejects.toThrow(new ForbiddenException(ERROR_CODE.USER_CAMPAIGN_NOT_AUTHORIZED));
    });
    it('정상적으로 즐겨찾기를 삭제한다.', async () => {
      // given
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: 'resourceProvider1',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: null,
          startedAt: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });
      await prismaService.user.create({
        data: {
          id: 'user1',
          provider: 'provider',
          nickname: 'user1',
        },
      });
      await prismaService.userCampaign.create({
        data: {
          id: 'userCampaign1',
          userId: 'user1',
          campaignId: 'campaign1',
        },
      });

      // when
      await campaignService.deleteUserCampaign({ userId: 'user1', id: 'userCampaign1' });

      // then
      const userCampaign = await prismaService.userCampaign.findMany({ where: { deletedAt: null } });
      expect(userCampaign).toHaveLength(0);
    });
  });
});
