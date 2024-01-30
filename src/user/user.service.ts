import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { IUserService } from './type/user.service.interface';
import { IUserRepository, USER_REPOSITORY } from './type/user.repository.interface';
import {
  IKakaoAuthDataSource,
  KAKAO_AUTH_DATA_SOURCE,
} from '../data-source/kakao-auth/type/kakao-auth.data-source.interface';
import { IJwtUtilityService, JWT_UTILITY_SERVICE } from '../library/jwt-utility/type/jwt-utility.service.interface';
import { ERROR_CODE } from '../library/exception/error.constant';

@Injectable()
export class UserService implements IUserService.Base {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository.Base,
    @Inject(KAKAO_AUTH_DATA_SOURCE)
    private readonly kakaoAuthDataSource: IKakaoAuthDataSource.Base,
    @Inject(JWT_UTILITY_SERVICE)
    private readonly jwtService: IJwtUtilityService.Base,
  ) {}

  async loginForKakao(options: IUserService.LoginForKakaoOptions): Promise<IUserService.LoginForKakaoResult> {
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
    let user: IUserRepository.User = await this.userRepository.findOne({
      kakaoId: kakaoUserInfo.id.toString(),
    });
    if (!user) {
      user = await this.userRepository.create({
        provider: 'kakao',
        nickname: kakaoUserInfo.name,
        kakaoId: kakaoUserInfo.id.toString(),
        email: kakaoUserInfo.email,
        profile: kakaoUserInfo.profileImage,
      });
    }

    // 토큰을 발급한다
    return {
      accessToken: await this.jwtService.generateAccessToken({
        userId: user.id,
        provider: 'kakao',
      }),
      refreshToken: await this.jwtService.generateRefreshToken({
        userId: user.id,
        provider: 'kakao',
      }),
    };
  }
}
