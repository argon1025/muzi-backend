import { InternalServerErrorException, Logger } from '@nestjs/common';
import { UserRepositoryMock } from '../../test/utils/user.repository.mock';
import { IKakaoAuthDataSource } from '../data-source/kakao-auth/type/kakao-auth.data-source.interface';
import { UserService } from './user.service';
import { ERROR_CODE } from '../library/exception/error.constant';

describe('UserService', () => {
  let userService: UserService;
  const userRepository = new UserRepositoryMock();
  const kakaoAuthDataSource = {} as any;
  const jwtService = {} as any;

  beforeEach(() => {
    userService = new UserService(userRepository, kakaoAuthDataSource, jwtService);
  });

  afterEach(() => {
    userRepository.clear();

    jest.restoreAllMocks();
  });

  describe('loginForKakao', () => {
    it('유저 정보를 찾았을 경우 토큰을 리턴한다.', async () => {
      // given
      kakaoAuthDataSource.getToken = jest.fn().mockResolvedValue({}); // 카카오 액세스 토큰 발급 성공
      const user: IKakaoAuthDataSource.GetUserInfoResult = {
        id: 123123,
        connectedAt: '2021-01-01',
        profileImage: 'https://test.com',
        name: 'test',
        email: '',
      };
      kakaoAuthDataSource.getUserInfo = jest.fn().mockResolvedValue(user); // 카카오 유저 정보 조회 성공
      userRepository.init([
        {
          id: 'j2h31jhk',
          provider: 'kakao',
          kakaoId: user.id.toString(),
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
      ]);
      jwtService.generateAccessToken = jest.fn().mockResolvedValue('token'); // 토큰 발급 성공
      jwtService.generateRefreshToken = jest.fn().mockResolvedValue('refreshToken'); // 리프레시 토큰 발급 성공
      jest.spyOn(userRepository, 'create').mockResolvedValue({} as any);
      // when
      const result = await userService.loginForKakao({ code: 'code', redirectUri: 'redirectUri' });

      // then
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'refreshToken' });
      expect(userRepository.create).toHaveBeenCalledTimes(0);
    });

    it('유저 정보를 찾지 못했을 경우 새로 가입처리 후 토큰을 반환한다.', async () => {
      // given
      kakaoAuthDataSource.getToken = jest.fn().mockResolvedValue({}); // 카카오 액세스 토큰 발급 성공
      const user: IKakaoAuthDataSource.GetUserInfoResult = {
        id: 123123,
        connectedAt: '2021-01-01',
        profileImage: 'https://test.com',
        name: 'test',
        email: '',
      };
      kakaoAuthDataSource.getUserInfo = jest.fn().mockResolvedValue(user); // 카카오 유저 정보 조회 성공
      jwtService.generateAccessToken = jest.fn().mockResolvedValue('token'); // 토큰 발급 성공
      jwtService.generateRefreshToken = jest.fn().mockResolvedValue('refreshToken'); // 리프레시 토큰 발급 성공

      // when
      const result = await userService.loginForKakao({ code: 'code', redirectUri: 'redirectUri' });

      // then
      expect(result).toEqual({ accessToken: 'token', refreshToken: 'refreshToken' });
      expect(userRepository.getAllForTest()).toHaveLength(1);
    });

    it('인가코드로부터 액세스 토큰을 받아오는데 실패했을 경우 에러를 던진다.', async () => {
      // given
      kakaoAuthDataSource.getToken = jest.fn().mockRejectedValue(new Error('error')); // 카카오 액세스 토큰 발급 실패
      jest.spyOn(Logger, 'error').mockImplementation(() => {});

      // when
      const result = userService.loginForKakao({ code: 'code', redirectUri: 'redirectUri' });

      // then
      await expect(result).rejects.toEqual(new InternalServerErrorException(ERROR_CODE.GET_KAKAO_TOKEN_FAILED));
    });
    it('액세스 토큰으로부터 유저정보를 받아오는데 실패했을 경우 에러를 던진다.', async () => {
      // given
      kakaoAuthDataSource.getToken = jest.fn().mockResolvedValue({}); // 카카오 액세스 토큰 발급 성공
      kakaoAuthDataSource.getUserInfo = jest.fn().mockRejectedValue(new Error('error')); // 카카오 유저 정보 조회 실패
      jest.spyOn(Logger, 'error').mockImplementation(() => {});

      // when
      const result = userService.loginForKakao({ code: 'code', redirectUri: 'redirectUri' });

      // then
      await expect(result).rejects.toEqual(new InternalServerErrorException(ERROR_CODE.GET_KAKAO_TOKEN_FAILED));
    });
  });
});
