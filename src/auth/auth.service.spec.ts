import { Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { IKakaoAuthDataSource } from '../data-source/kakao-auth/type/kakao-auth.data-source.interface';
import { ERROR_CODE } from '../library/exception/error.constant';
import { AuthService } from './auth.service';
import { PrismaService } from '../library/prisma/prisma.service';
import { UserProvider } from './type/auth.type';
import { INaverAuthDataSource } from '../data-source/naver-auth/type/naver-auth.data-source.interface';

describe('AuthService', () => {
  let authService: AuthService;
  const prismaService = new PrismaService();
  const kakaoAuthDataSource = {} as any;
  const naverAuthDataSource = {} as any;

  beforeEach(() => {
    authService = new AuthService(kakaoAuthDataSource, prismaService, naverAuthDataSource);
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
      naverAuthDataSource.getToken = jest.fn().mockResolvedValue({}); // 카카오 액세스 토큰 발급 성공
      const user: INaverAuthDataSource.GetUserInfoResult = {
        id: 'id',
        email: 'test@naver.com',
        name: '이성록',
        nickname: '성록',
        gender: 'M',
        birthday: '10-25',
        profileImage: 'https://ssl.pstatic.net/static/pwe/address/img_profile.png',
      };
      naverAuthDataSource.getUserInfo = jest.fn().mockResolvedValue(user); // 카카오 유저 정보 조회 성공
      await prismaService.user.create({ data: { provider: UserProvider.NAVER, naverId: user.id, nickname: user.nickname } });

      // when
      const result = await authService.loginForNaver({ code: 'code', state: 'state' });

      // then
      expect(result.naverId).toEqual('id');
    });
    it('유저 정보를 찾지 못했을 경우 새로 가입처리 후 유저정보를 반환한다.', async () => {
      // given
      naverAuthDataSource.getToken = jest.fn().mockResolvedValue({}); // 카카오 액세스 토큰 발급 성공
      const user: INaverAuthDataSource.GetUserInfoResult = {
        id: 'id',
        email: 'test@naver.com',
        name: '이성록',
        nickname: '성록',
        gender: 'M',
        birthday: '10-25',
        profileImage: 'https://ssl.pstatic.net/static/pwe/address/img_profile.png',
      };
      naverAuthDataSource.getUserInfo = jest.fn().mockResolvedValue(user); // 카카오 유저 정보 조회 성공

      // when
      const result = await authService.loginForNaver({ code: 'code', state: 'state' });

      // then
      expect(result.naverId).toEqual('id');
    });
    it('인가코드로부터 액세스 토큰을 받아오는데 실패했을 경우 에러를 던진다.', async () => {
      // given
      naverAuthDataSource.getToken = jest.fn().mockRejectedValue(new Error('error')); // 카카오 액세스 토큰 발급 실패
      jest.spyOn(Logger, 'error').mockImplementation(() => {});

      // when
      const result = authService.loginForNaver({ code: 'code', state: 'state' });

      // then
      await expect(result).rejects.toEqual(new InternalServerErrorException(ERROR_CODE.GET_NAVER_TOKEN_FAILED));
    });
    it('액세스 토큰으로부터 유저정보를 받아오는데 실패했을 경우 에러를 던진다.', async () => {
      // given
      naverAuthDataSource.getToken = jest.fn().mockResolvedValue({}); // 카카오 액세스 토큰 발급 성공
      naverAuthDataSource.getUserInfo = jest.fn().mockRejectedValue(new Error('error')); // 카카오 유저 정보 조회 실패
      jest.spyOn(Logger, 'error').mockImplementation(() => {});

      // when
      const result = authService.loginForNaver({ code: 'code', state: 'state' });

      // then
      await expect(result).rejects.toEqual(new InternalServerErrorException(ERROR_CODE.GET_NAVER_TOKEN_FAILED));
    });
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

  describe('joinForUserId', () => {
    it('동일한 아이디로 가입된 유저가 없을 경우 가입처리를 한다.', async () => {
      // given & when
      await authService.joinForUserId({
        userId: 'userId',
        password: 'password',
        nickname: 'test',
      });

      // then
      const userList = await prismaService.user.findMany();
      expect(userList.length).toBe(1);
      expect(userList.pop().userId).toBe('userId');
    });
    it('동일한 아이디로 가입된 유저가 있을 경우 에러를 던진다.', async () => {
      // given
      await prismaService.user.create({
        data: {
          provider: UserProvider.USER_ID,
          userId: 'userId',
          password: 'password',
          nickname: 'test',
          email: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });

      // when
      const result = authService.joinForUserId({
        userId: 'userId',
        password: 'password',
        nickname: 'test',
      });

      // then
      await expect(result).rejects.toThrow(new BadRequestException(ERROR_CODE.USER_ALREADY_EXIST));
      const userList = await prismaService.user.findMany();
      expect(userList.length).toBe(1);
    });
    it('탈퇴한 유저 아이디로 가입 요청이 들어왔을 경우 가입처리를 한다.', async () => {
      // given
      await prismaService.user.create({
        data: {
          provider: UserProvider.USER_ID,
          userId: 'userId',
          password: 'password',
          nickname: 'test',
          email: null,
          deletedAt: new Date(),
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      });

      // when
      await authService.joinForUserId({
        userId: 'userId',
        password: 'password',
        nickname: 'test',
      });

      // then
      const userList = await prismaService.user.findMany();
      expect(userList.length).toBe(2);
      expect(userList.pop().userId).toBe('userId');
    });
  });

  describe('loginForUserId', () => {
    it('로그인에 성공 했을 경우 유저 정보를 반환한다', async () => {
      // given
      await authService.joinForUserId({
        userId: 'userId',
        password: 'password',
        nickname: 'test',
      });

      // when
      const result = await authService.loginForUserId({
        userId: 'userId',
        password: 'password',
      });

      // then
      expect(result.userId).toBe('userId');
    });
    it('유저를 찾지 못했을 경우 에러를 던진다.', async () => {
      // given & when
      const result = authService.loginForUserId({
        userId: 'userId',
        password: 'WongPassword',
      });

      // then
      await expect(result).rejects.toThrow(new NotFoundException(ERROR_CODE.USER_NOT_FOUND));
    });
    it('비밀번호가 일치하지 않을 경우 에러를 던진다.', async () => {
      // given
      await authService.joinForUserId({
        userId: 'userId',
        password: 'password',
        nickname: 'test',
      });

      // when
      const result = authService.loginForUserId({
        userId: 'userId',
        password: 'WongPassword',
      });

      // then
      await expect(result).rejects.toThrow(new NotFoundException(ERROR_CODE.USER_NOT_FOUND));
    });
  });
});
