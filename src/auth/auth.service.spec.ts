import { Logger, InternalServerErrorException } from '@nestjs/common';
import { IKakaoAuthDataSource } from '../data-source/kakao-auth/type/kakao-auth.data-source.interface';
import { ERROR_CODE } from '../library/exception/error.constant';
import { AuthService } from './auth.service';
import { PrismaService } from '../library/prisma/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  const prismaService = new PrismaService();
  const kakaoAuthDataSource = {} as any;

  beforeEach(() => {
    authService = new AuthService(kakaoAuthDataSource, prismaService);
  });

  afterEach(async () => {
    await prismaService.$transaction([prismaService.user.deleteMany()]);
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('loginForKakao', () => {
    it('유저 정보를 찾았을 경우 유저 정보를 리턴한다.', async () => {
      // given
      kakaoAuthDataSource.getToken = jest.fn().mockResolvedValue({}); // 카카오 액세스 토큰 발급 성공
      const user: IKakaoAuthDataSource.GetUserInfoResult = {
        id: 1,
        connectedAt: '2021-01-01',
        profileImage: 'https://test.com',
        name: 'test',
        email: '',
      };
      kakaoAuthDataSource.getUserInfo = jest.fn().mockResolvedValue(user); // 카카오 유저 정보 조회 성공
      const dataBaseData = [
        {
          id: 'j2h31jhk',
          provider: 'kakao',
          kakaoId: '1',
          nickname: 'test',
          email: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
        {
          id: 'j2h31jhk1',
          provider: 'kakao',
          kakaoId: '123123123',
          nickname: 'test',
          email: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      prismaService.user.createMany({ data: dataBaseData });
      // when
      const result = await authService.loginForKakao({ code: 'code', redirectUri: 'redirectUri' });

      // then
      expect(result.kakaoId).toEqual('1');
    });

    it('유저 정보를 찾지 못했을 경우 새로 가입처리 후 유저정보를 반환한다.', async () => {
      // given
      kakaoAuthDataSource.getToken = jest.fn().mockResolvedValue({}); // 카카오 액세스 토큰 발급 성공
      const user: IKakaoAuthDataSource.GetUserInfoResult = {
        id: 1,
        connectedAt: '2021-01-01',
        profileImage: 'https://test.com',
        name: 'test',
        email: '',
      };
      kakaoAuthDataSource.getUserInfo = jest.fn().mockResolvedValue(user); // 카카오 유저 정보 조회 성공

      // when
      const result = await authService.loginForKakao({ code: 'code', redirectUri: 'redirectUri' });

      // then
      expect(result.kakaoId).toBe('1');
    });

    it('인가코드로부터 액세스 토큰을 받아오는데 실패했을 경우 에러를 던진다.', async () => {
      // given
      kakaoAuthDataSource.getToken = jest.fn().mockRejectedValue(new Error('error')); // 카카오 액세스 토큰 발급 실패
      jest.spyOn(Logger, 'error').mockImplementation(() => {});

      // when
      const result = authService.loginForKakao({ code: 'code', redirectUri: 'redirectUri' });

      // then
      await expect(result).rejects.toEqual(new InternalServerErrorException(ERROR_CODE.GET_KAKAO_TOKEN_FAILED));
    });
    it('액세스 토큰으로부터 유저정보를 받아오는데 실패했을 경우 에러를 던진다.', async () => {
      // given
      kakaoAuthDataSource.getToken = jest.fn().mockResolvedValue({}); // 카카오 액세스 토큰 발급 성공
      kakaoAuthDataSource.getUserInfo = jest.fn().mockRejectedValue(new Error('error')); // 카카오 유저 정보 조회 실패
      jest.spyOn(Logger, 'error').mockImplementation(() => {});

      // when
      const result = authService.loginForKakao({ code: 'code', redirectUri: 'redirectUri' });

      // then
      await expect(result).rejects.toEqual(new InternalServerErrorException(ERROR_CODE.GET_KAKAO_TOKEN_FAILED));
    });
  });
});
