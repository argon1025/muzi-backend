import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Test } from '@nestjs/testing';
import { CampaignService } from './campaign.service';
import { PrismaService } from '../library/prisma/prisma.service';
import { ERROR_CODE } from '../library/exception/error.constant';
import { IParsingEventService, PARSING_EVENT_SERVICE } from '../library/parsing-event/type/parsing-event.interface';
import { ParsingEventService } from '../library/parsing-event/parsing-event.service';
import { ICampaignService } from './type/campaign.service.interface';

describe('CampaignService', () => {
  let campaignService: CampaignService;
  let parsingEventService: ParsingEventService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CampaignService, PrismaService, { provide: PARSING_EVENT_SERVICE, useClass: ParsingEventService }],
    }).compile();

    campaignService = moduleRef.get<CampaignService>(CampaignService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    parsingEventService = moduleRef.get<ParsingEventService>(PARSING_EVENT_SERVICE);
  });

  afterEach(async () => {
    await prismaService.$transaction([
      prismaService.userCampaign.deleteMany(),
      prismaService.campaign.deleteMany(),
      prismaService.user.deleteMany(),
      prismaService.parsingEvent.deleteMany(),
    ]);
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('findMany', () => {
    it('전체 데이터를 요청 했을 경우.', async () => {
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
          deletedAt: fakeNowTime,
          updatedAt: fakeNowTime,
          createdAt: fakeNowTime,
        },
      ];
      await prismaService.campaign.createMany({ data: campaignList });

      // when
      const result = await campaignService.findMany({ size: 10, page: 1 });

      // then
      expect(result.list.length).toBe(1);
      expect(result.list[0].id).toBe('campaign1');
      expect(result.total).toBe(1);
    });

    it('타이틀을 검색 했을 경우', async () => {
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
      const result = await campaignService.findMany({ title: 'title1', size: 10, page: 1 });

      // then
      expect(result.total).toBe(1);
      expect(result.list[0].title).toBe('title1');
    });

    it('카테고리를 검색 했을 경우', async () => {
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
      const result = await campaignService.findMany({ category: 'category1', size: 10, page: 1 });

      // then
      expect(result.total).toBe(1);
      expect(result.list[0].category).toBe('category1');
    });

    it('신청 진행중인 캠페인을 검색했을 경우', async () => {
      // given
      jest.useFakeTimers({ advanceTimers: true });
      // 캠페인 등록일-마감일 설정
      const startedAt = DateTime.fromISO('2023-01-02T00:00:00Z').toJSDate();
      const endedAt = DateTime.fromISO('2023-01-04T00:00:00Z').toJSDate();
      // 캠페인 데이터 등록
      await prismaService.campaign.create({
        data: {
          id: 'campaign123',
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
          startedAt,
          endedAt,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });

      // when
      // 응모 시작일 전에 요청한 경우
      jest.setSystemTime(DateTime.fromISO('2023-01-01T23:59:59Z').toJSDate());
      const test1 = await campaignService.findMany({ hasAvailable: true, size: 10, page: 1 });

      // // 응모 마감일 이후에 요청한 경우
      jest.setSystemTime(DateTime.fromISO('2023-01-04T00:00:01Z').toJSDate());
      const test2 = await campaignService.findMany({ hasAvailable: true, size: 10, page: 1 });

      // 응모 시작일과 동일한 시간에 요청한 경우
      jest.setSystemTime(DateTime.fromISO('2023-01-02T00:00:00Z').toJSDate());
      const test3 = await campaignService.findMany({ hasAvailable: true, size: 10, page: 1 });

      // // 응모 마감일과 동일한 시간에 요청한 경우
      jest.setSystemTime(DateTime.fromISO('2023-01-04T00:00:00Z').toJSDate());
      const test4 = await campaignService.findMany({ hasAvailable: true, size: 10, page: 1 });

      // // 응모 가능일 내에 요청한 경우
      jest.setSystemTime(DateTime.fromISO('2023-01-03T15:00:00Z').toJSDate());
      const test5 = await campaignService.findMany({ hasAvailable: true, size: 10, page: 1 });

      // then
      expect(test1.total).toBe(0);
      expect(test2.total).toBe(0);
      expect(test3.total).toBe(1);
      expect(test4.total).toBe(1);
      expect(test5.total).toBe(1);
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
      ];
      await prismaService.campaign.createMany({ data: campaignList });

      // when
      const result = await campaignService.findMany({ size: 10, page: 1 });

      // then
      expect(result).toEqual({ list: [], total: 0 });
    });

    it('마감일 임박순 정렬을 요청했을 경우', async () => {
      // given
      // 마감일은 동일하나 등록일이 다른 케이스, 마감일이 다른 케이스 데이터 추가
      await prismaService.campaign.createMany({
        data: [
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
            endedAt: DateTime.fromISO('2023-01-04T00:00:00Z').toJSDate(),
            startedAt: null,
            deletedAt: null,
            updatedAt: new Date(),
            createdAt: DateTime.fromISO('2023-01-04T00:00:00Z').toJSDate(),
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
            recruitCount: 1,
            applyCount: 1,
            drawAt: null,
            endedAt: DateTime.fromISO('2023-01-04T00:00:00Z').toJSDate(),
            startedAt: null,
            deletedAt: null,
            updatedAt: new Date(),
            createdAt: DateTime.fromISO('2023-01-05T00:00:00Z').toJSDate(),
          },
          {
            id: 'campaign3',
            duplicateId: 'duplicateId3',
            resourceProvider: 'resourceProvider3',
            originUrl: 'originUrl3',
            title: 'title3',
            category: 'category3',
            targetPlatforms: 'targetPlatforms3',
            thumbnail: 'thumbnail3',
            address: 'address3',
            recruitCount: 1,
            applyCount: 1,
            drawAt: null,
            endedAt: DateTime.fromISO('2023-01-03T00:00:00Z').toJSDate(),
            startedAt: null,
            deletedAt: null,
            updatedAt: new Date(),
            createdAt: DateTime.fromISO('2023-01-05T00:00:00Z').toJSDate(),
          },
        ],
      });

      // when
      const result = await campaignService.findMany({ page: 1, size: 10, orderBy: ICampaignService.FindManyOrderByOption.ENDED_AT_ASC });

      // then
      expect(result.total).toBe(3);
      expect(result.list[0].id).toBe('campaign3');
      expect(result.list[1].id).toBe('campaign2');
      expect(result.list[2].id).toBe('campaign1');
    });
    it('신청일 임박순 정렬을 요청했을 경우', async () => {
      // given
      // 신청일은 동일하나 등록일이 다른 케이스, 신청일이 다른 케이스 데이터 추가
      await prismaService.campaign.createMany({
        data: [
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
            startedAt: DateTime.fromISO('2023-01-04T00:00:00Z').toJSDate(),
            deletedAt: null,
            updatedAt: new Date(),
            createdAt: DateTime.fromISO('2023-01-04T00:00:00Z').toJSDate(),
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
            recruitCount: 1,
            applyCount: 1,
            drawAt: null,
            endedAt: null,
            startedAt: DateTime.fromISO('2023-01-04T00:00:00Z').toJSDate(),
            deletedAt: null,
            updatedAt: new Date(),
            createdAt: DateTime.fromISO('2023-01-05T00:00:00Z').toJSDate(),
          },
          {
            id: 'campaign3',
            duplicateId: 'duplicateId3',
            resourceProvider: 'resourceProvider3',
            originUrl: 'originUrl3',
            title: 'title3',
            category: 'category3',
            targetPlatforms: 'targetPlatforms3',
            thumbnail: 'thumbnail3',
            address: 'address3',
            recruitCount: 1,
            applyCount: 1,
            drawAt: null,
            endedAt: null,
            startedAt: DateTime.fromISO('2023-01-03T00:00:00Z').toJSDate(),
            deletedAt: null,
            updatedAt: new Date(),
            createdAt: DateTime.fromISO('2023-01-05T00:00:00Z').toJSDate(),
          },
        ],
      });

      // when
      const result = await campaignService.findMany({ page: 1, size: 10, orderBy: ICampaignService.FindManyOrderByOption.STARTED_AT_ASC });

      // then
      expect(result.total).toBe(3);
      expect(result.list[0].id).toBe('campaign3');
      expect(result.list[1].id).toBe('campaign2');
      expect(result.list[2].id).toBe('campaign1');
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

  describe('createUpdateRequestEvent', () => {
    it('존재하지 않는 캠페인인 경우 에러를 반환한다.', async () => {
      // given
      // 캠페인 데이터를 설정하지 않는다

      // when
      const result = campaignService.createUpdateRequestEvent({ id: '1' });

      // then
      await expect(result).rejects.toThrow(new NotFoundException(ERROR_CODE.CAMPAIGN_NOT_FOUND));
    });

    it('삭제된 캠페인인 경우 에러를 반환한다.', async () => {
      // given
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: '지원하지 않는 타입',
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

      // when
      const result = campaignService.createUpdateRequestEvent({ id: 'campaign1' });

      // then
      await expect(result).rejects.toThrow(new NotFoundException(ERROR_CODE.CAMPAIGN_NOT_FOUND));
    });

    it('업데이트 요청이 지원되지 않는 캠페인 타입인 경우 에러를 반환한다.', async () => {
      // given
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'duplicateId1',
          resourceProvider: '지원하지 않는 타입',
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

      // when
      const result = campaignService.createUpdateRequestEvent({ id: 'campaign1' });

      // then
      await expect(result).rejects.toThrow(new BadRequestException(ERROR_CODE.CAMPAIGN_TYPE_NOT_ALLOWED));
    });

    it('캠페인이 종료된 경우 에러를 반환한다.', async () => {
      // given
      jest.useFakeTimers({ advanceTimers: true });
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'DINNER_QUEEN_1',
          resourceProvider: 'DINNER_QUEEN',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: DateTime.fromISO('2023-01-01T01:00:00Z').toJSDate(),
          startedAt: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });

      // when
      jest.setSystemTime(DateTime.fromISO('2023-01-02T01:00:00Z').toJSDate());
      const result = campaignService.createUpdateRequestEvent({ id: 'campaign1' });

      // then
      await expect(result).rejects.toThrow(new BadRequestException(ERROR_CODE.CAMPAIGN_ALREADY_ENDED));
    });

    it('캠페인 종료날짜가 null인 경우', async () => {
      // given
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'DINNER_QUEEN_1',
          resourceProvider: 'DINNER_QUEEN',
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

      // when
      const result = await campaignService.createUpdateRequestEvent({ id: 'campaign1' });

      // then
      expect(result).toBeUndefined();
      const eventList = await prismaService.parsingEvent.findMany();
      expect(eventList.length).toBe(1);
    });

    it('업데이트 요청이 가능한 캠에인인 경우 이벤트를 생성한다.', async () => {
      // given
      // 캠페인 구성
      jest.useFakeTimers({ advanceTimers: true });
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'DINNER_QUEEN_1',
          resourceProvider: 'DINNER_QUEEN',
          originUrl: 'originUrl1',
          title: 'title1',
          category: 'category1',
          targetPlatforms: 'targetPlatforms1',
          thumbnail: 'thumbnail1',
          address: 'address1',
          recruitCount: 1,
          applyCount: 1,
          drawAt: null,
          endedAt: DateTime.fromISO('2023-01-02T00:00:00Z').toJSDate(),
          startedAt: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });

      // when
      jest.setSystemTime(DateTime.fromISO('2023-01-01T00:00:00Z').toJSDate());
      const result = await campaignService.createUpdateRequestEvent({ id: 'campaign1' });

      // then
      expect(result).toBeUndefined();
      const eventList = await prismaService.parsingEvent.findMany();
      expect(eventList.length).toBe(1);
    });

    it('이미 생성되어 대기중이거나 처리중인 요청이 있는경우 추가 작업을 하지않고 종료한다.', async () => {
      // given
      // 캠페인 구성
      await prismaService.campaign.create({
        data: {
          id: 'campaign1',
          duplicateId: 'DINNER_QUEEN_1',
          resourceProvider: 'DINNER_QUEEN',
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
      // 구성된 캠페인의 이벤트 생성
      await parsingEventService.createEvent({
        eventType: IParsingEventService.EventType.DINNER_QUEEN,
        eventMessage: { requestType: 'UPDATE', targetId: '1' },
      });

      // when
      const result = await campaignService.createUpdateRequestEvent({ id: 'campaign1' });

      // then
      expect(result).toBeUndefined();
      const eventList = await prismaService.parsingEvent.findMany();
      expect(eventList.length).toBe(1);
    });
  });
});
