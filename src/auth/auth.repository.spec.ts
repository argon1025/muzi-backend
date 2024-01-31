import { AuthRepository } from './auth.repository';
import { IAuthRepository } from './type/auth.repository.interface';

describe('AuthRepository', () => {
  const prismaStub = { user: { findFirst: jest.fn(), create: jest.fn() } };
  let authRepository: AuthRepository = new AuthRepository(prismaStub as any);

  beforeEach(() => {
    authRepository = new AuthRepository(prismaStub as any);
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
      prismaStub.user.findFirst.mockResolvedValue(user);

      // when
      const result = await authRepository.findOne({ id: user.id, kakaoId: user.kakaoId });

      // then
      expect(result).toEqual(user);
    });

    it('유저를 찾지 못했을 경우 null을 반환한다.', async () => {
      // given
      prismaStub.user.findFirst.mockResolvedValue(null);

      // when
      const result = await authRepository.findOne({ id: '123123', kakaoId: '123123' });

      // then
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('유저를 생성하고 생성된 유저 정보를 반환한다.', async () => {
      // given
      const user: IAuthRepository.CreateUserOptions = {
        provider: 'kakao',
        kakaoId: '123123',
        nickname: 'test',
        email: null,
        profile: null,
      };
      prismaStub.user.create.mockResolvedValue(user);

      // when
      const result = await authRepository.create(user);

      // then
      expect(result).toEqual(user);
    });
  });
});
