import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  const prismaStub = { user: { findFirst: jest.fn() } };
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository(prismaStub as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('유저를 찾았을 경우 유저를 반환한다.', async () => {
      // given
      const user = {
        id: 'asdjk2njk3123',
        provider: 'kakao',
        kakaoId: '123123',
        nickname: 'test',
        email: null,
        profile: null,
        deletedAt: null,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      prismaStub.user.findFirst.mockResolvedValue(user);

      // when
      const result = await userRepository.getUserById(user.id);

      // then
      expect(result).toEqual(user);
    });

    it('유저를 찾지 못했을 경우 null을 반환한다.', async () => {
      // given
      prismaStub.user.findFirst.mockResolvedValue(null);

      // when
      const result = await userRepository.getUserById('1');

      // then
      expect(result).toBeNull();
    });
  });
});
