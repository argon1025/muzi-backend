import { Injectable, Inject, Logger, InternalServerErrorException } from '@nestjs/common';
import { KAKAO_AUTH_DATA_SOURCE, IKakaoAuthDataSource } from '../data-source/kakao-auth/type/kakao-auth.data-source.interface';
import { ERROR_CODE } from '../library/exception/error.constant';
import { IAuthService } from './type/auth.service.interface';
import { PrismaService } from '../library/prisma/prisma.service';

@Injectable()
export class AuthService implements IAuthService.Base {
  constructor(
    @Inject(KAKAO_AUTH_DATA_SOURCE)
    private readonly kakaoAuthDataSource: IKakaoAuthDataSource.Base,
    private readonly prismaService: PrismaService,
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
      Logger.error(error);
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
          provider: 'kakao',
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
}
