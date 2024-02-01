import { UserCampaignRepository } from './user-campaign.repository';

describe('UserCampaignRepository', () => {
  const prismaServiceStub = {
    userCampaign: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn(), create: jest.fn() },
  };
  let userCampaignRepository: UserCampaignRepository;

  beforeEach(() => {
    userCampaignRepository = new UserCampaignRepository(prismaServiceStub as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneByUserIdAndCampaignId', () => {
    it('유저가 즐겨찾기한 캠페인을 조회하고 반환한다', async () => {
      // given
      const options = { userId: 'userId', campaignId: 'campaignId' };
      const userCampaign = { id: 'id', userId: 'userId', campaignDetail: { id: 'campaignId' } };
      prismaServiceStub.userCampaign.findFirst.mockResolvedValue(userCampaign);

      // when
      const result = await userCampaignRepository.findOneByUserIdAndCampaignId(options);

      // then
      expect(result).toEqual(userCampaign);
    });
    it('유저가 즐겨찾기한 캠페인을 찾을 수 없으면 null을 반환한다', async () => {
      // given
      const options = { userId: 'userId', campaignId: 'campaignId' };
      prismaServiceStub.userCampaign.findFirst.mockResolvedValue(null);

      // when
      const result = await userCampaignRepository.findOneByUserIdAndCampaignId(options);

      // then
      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('즐겨찾기한 캠페인을 조회하고 반환한다', async () => {
      // given
      const options = { id: 'id' };
      const userCampaign = { id: 'id', userId: 'userId', campaignDetail: { id: 'campaignId' } };
      prismaServiceStub.userCampaign.findFirst.mockResolvedValue(userCampaign);

      // when
      const result = await userCampaignRepository.findOneById(options);

      // then
      expect(result).toEqual(userCampaign);
    });
    it('즐겨찾기한 캠페인을 찾을 수 없으면 null을 반환한다', async () => {
      // given
      const options = { id: 'id' };
      prismaServiceStub.userCampaign.findFirst.mockResolvedValue(null);

      // when
      const result = await userCampaignRepository.findOneById(options);

      // then
      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('유저별 즐겨찾기한 캠페인 리스트를 조회하고 반환한다', async () => {
      // given
      const options = { userId: 'userId', size: 10, page: 1 };
      const list = [];
      const total = 0;
      prismaServiceStub.userCampaign.findMany.mockResolvedValue(list);
      prismaServiceStub.userCampaign.count.mockResolvedValue(total);

      // when
      const result = await userCampaignRepository.findMany(options);

      // then
      expect(result).toEqual({ list, total });
    });
  });
  describe('create', () => {
    it('유저별 즐겨찾기한 캠페인을 등록한다', async () => {
      // given
      const options = { userId: 'userId', campaignId: 'campaignId' };

      // when
      await userCampaignRepository.create(options);

      // then
      expect(prismaServiceStub.userCampaign.create).toHaveBeenCalledWith({ data: options });
    });
  });

  describe('delete', () => {
    it('유저별 즐겨찾기한 캠페인을 삭제한다', async () => {
      // given
      const options = { id: 'id' };

      // when
      await userCampaignRepository.delete(options);

      // then
      expect(prismaServiceStub.userCampaign.update).toHaveBeenCalledWith({ where: { id: options.id }, data: { deletedAt: new Date() } });
    });
  });
});
