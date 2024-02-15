import { Injectable, Inject, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { KAKAO_AUTH_DATA_SOURCE, IKakaoAuthDataSource } from '../data-source/kakao-auth/type/kakao-auth.data-source.interface';
import { ERROR_CODE } from '../library/exception/error.constant';
import { IAuthService } from './type/auth.service.interface';
import { PrismaService } from '../library/prisma/prisma.service';
import { UserProvider } from './type/auth.type';
import { INaverAuthDataSource, NAVER_AUTH_DATA_SOURCE } from '../data-source/naver-auth/type/naver-auth.data-source.interface';

@Injectable()
export class AuthService implements IAuthService.Base {
  constructor(
    @Inject(KAKAO_AUTH_DATA_SOURCE)
    private readonly kakaoAuthDataSource: IKakaoAuthDataSource.Base,
    private readonly prismaService: PrismaService,
    @Inject(NAVER_AUTH_DATA_SOURCE)
    private readonly naverAuthDataSource: INaverAuthDataSource.Base,
  ) {}

  async loginForKakao(options: IAuthService.LoginForKakaoOptions): Promise<IAuthService.LoginForKakaoResult> {
    // 카카오 인가코드를 통해 카카오 액세스 토큰을 발급받은 후 카카오 유저 정보를 조회한다.
    let kakaoUserInfo: IKakaoAuthDataSource.GetUserInfoResult;
    try {
      const getTokenResult = await this.kakaoAuthDataSource.getToken({
        code: options.code,
        redirectUri: options.redirectUri,
      });
      kakaoUserInfo = await this.kakaoAuthDataSource.getUserInfo({ accessToken: getTokenResult.accessToken });
    } catch (error) {
      Logger.error(error, options, 'loginForKakao');
      throw new InternalServerErrorException(ERROR_CODE.GET_KAKAO_TOKEN_FAILED);
    }

    // 카카오 유저 정보를 바탕으로 유저를 찾거나 생성한다.
    let user = await this.prismaService.user.findFirst({
      where: {
        kakaoId: kakaoUserInfo.id.toString(),
      },
    });
    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          provider: UserProvider.KAKAO,
          nickname: kakaoUserInfo.name,
          kakaoId: kakaoUserInfo.id.toString(),
          email: kakaoUserInfo.email,
          profile: kakaoUserInfo.profileImage,
        },
      });
    }

    // 유저 정보를 반환한다
    return user;
  }

  async joinForUserId(options: IAuthService.JoinForUserIdOptions): Promise<void> {
    const { userId, password, nickname, email, profile } = options;
    // 동일한 아이디로 가입된 유저가 있는지 확인한다.
    const hasJoined = await this.prismaService.user.findFirst({ where: { userId, deletedAt: null } });
    if (hasJoined) {
      throw new BadRequestException(ERROR_CODE.USER_ALREADY_EXIST);
    }

    // 유저를 생성한다.
    await this.prismaService.user.create({
      data: {
        provider: UserProvider.USER_ID,
        userId,
        password: bcrypt.hashSync(password, 10),
        nickname,
        email,
        profile,
      },
    });
  }

  async loginForUserId(options: IAuthService.LoginForUserIdOptions): Promise<IAuthService.LoginForUserIdResult> {
    const { userId, password } = options;
    // 아이디로 유저를 조회한다.
    const userInfo = await this.prismaService.user.findFirst({ where: { userId, deletedAt: null } });
    if (!userInfo) {
      throw new NotFoundException(ERROR_CODE.USER_NOT_FOUND);
    }

    // 비밀번호를 확인한다.
    const isPasswordMatch = bcrypt.compareSync(password, userInfo.password);
    if (!isPasswordMatch) {
      throw new NotFoundException(ERROR_CODE.USER_NOT_FOUND);
    }
    return userInfo;
  }

  async loginForNaver(options: IAuthService.LoginForNaverOptions): Promise<IAuthService.LoginForNaverResult> {
    const { code, state } = options;

    // 액세스 토큰을 발급받는다.
    let accessToken: string;
    try {
      const result = await this.naverAuthDataSource.getToken({ code, state });
      accessToken = result.accessToken;
    } catch (error) {
      Logger.error(error, options, 'loginForNaverGetToken');
      throw new InternalServerErrorException(ERROR_CODE.GET_NAVER_TOKEN_FAILED);
    }

    // 네이버 유저 정보를 조회한다.
    let naverUserInfo: INaverAuthDataSource.GetUserInfoResult;
    try {
      naverUserInfo = await this.naverAuthDataSource.getUserInfo({ accessToken });
    } catch (error) {
      Logger.error(error, options, 'loginForNaverGetUserInfo');
      throw new InternalServerErrorException(ERROR_CODE.GET_NAVER_TOKEN_FAILED);
    }

    // 네이버 유저 정보를 바탕으로 유저를 찾거나 생성한다.
    let user = await this.prismaService.user.findFirst({ where: { naverId: naverUserInfo.id } });
    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          provider: UserProvider.NAVER,
          nickname: naverUserInfo.nickname,
          naverId: naverUserInfo.id,
          email: naverUserInfo.email,
          profile: naverUserInfo.profileImage,
        },
      });
    }

    return user;
  }
}
