import { CampaignRepository } from './campaign.repository';

describe('CampaignRepository', () => {
  const prismaServiceStub = { campaign: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() } };
  let campaignRepository: CampaignRepository;

  beforeEach(() => {
    campaignRepository = new CampaignRepository(prismaServiceStub as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findMany', () => {
    it('캠페인 리스트를 조회하고 반환한다', async () => {
      // given
      const options = { title: 'title', city: 'city', size: 10, page: 1 };
      const list = [];
      const total = 0;
      prismaServiceStub.campaign.findMany.mockResolvedValue(list);
      prismaServiceStub.campaign.count.mockResolvedValue(total);

      // when
      const result = await campaignRepository.findMany(options);

      // then
      expect(result).toEqual({ list, total });
    });
  });

  describe('findOne', () => {
    it('캠페인을 상세 조회하고 반환한다', async () => {
      // given
      const id = 'id';
      const campaign = {
        id,
        resourceProvider: 'resourceProvider',
        targetPlatforms: 'targetPlatforms',
        category: 'category',
        title: 'title',
        thumbnail: 'thumbnail',
        city: 'city',
        startedAt: new Date(),
        endedAt: new Date(),
        drawAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      prismaServiceStub.campaign.findFirst.mockResolvedValue(campaign);

      // when
      const result = await campaignRepository.findOne(id);

      // then
      expect(result).toEqual(campaign);
    });
    it('캠페인을 찾을 수 없으면 null을 반환한다', async () => {
      // given
      const id = 'id';
      prismaServiceStub.campaign.findFirst.mockResolvedValue(null);

      // when
      const result = await campaignRepository.findOne(id);

      // then
      expect(result).toBeNull();
    });
  });
});
