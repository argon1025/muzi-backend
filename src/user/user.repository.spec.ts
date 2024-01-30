import { IUserRepository } from './type/user.repository.interface';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  const prismaStub = { user: { findUnique: jest.fn(), create: jest.fn() } };
  let userRepository: UserRepository = new UserRepository(prismaStub as any);

  beforeEach(() => {
    userRepository = new UserRepository(prismaStub as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
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
      prismaStub.user.findUnique.mockResolvedValue(user);

      // when
      const result = await userRepository.findOne({ id: user.id, kakaoId: user.kakaoId });

      // then
      expect(result).toEqual(user);
    });

    it('유저를 찾지 못했을 경우 null을 반환한다.', async () => {
      // given
      prismaStub.user.findUnique.mockResolvedValue(null);

      // when
      const result = await userRepository.findOne({ id: '123123', kakaoId: '123123' });

      // then
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('유저를 생성하고 생성된 유저 정보를 반환한다.', async () => {
      // given
      const user: IUserRepository.CreateUserOptions = {
        provider: 'kakao',
        kakaoId: '123123',
        nickname: 'test',
        email: null,
        profile: null,
      };
      prismaStub.user.create.mockResolvedValue(user);

      // when
      const result = await userRepository.create(user);

      // then
      expect(result).toEqual(user);
    });
  });
});
