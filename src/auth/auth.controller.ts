import { Controller, Inject, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { JWT_UTILITY_SERVICE, IJwtUtilityService } from '../library/jwt-utility/type/jwt-utility.service.interface';
import { KakaoLoginRequest } from './dto/kakao-login.dto';
import { AUTH_SERVICE, IAuthService } from './type/auth.service.interface';

@Controller('auth')
export class AuthController {
  private readonly KAKAO_REDIRECT_URL = this.configService.get<string>('KAKAO_REDIRECT_URL');

  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService.Base,
    @Inject(JWT_UTILITY_SERVICE)
    private readonly jwtService: IJwtUtilityService.Base,
    private readonly configService: ConfigService,
  ) {}

  @Get('kakao')
  async kakaoLogin(@Query() request: KakaoLoginRequest, @Res({ passthrough: true }) response: Response) {
    // 유저정보 조회
    const userInfo = await this.authService.loginForKakao({
      code: request.code,
      redirectUri: this.KAKAO_REDIRECT_URL,
    });

    // accessToken, refreshToken 토큰 발급
    const { token: accessToken } = await this.jwtService.generateAccessToken({
      userId: userInfo.id,
      provider: 'kakao',
    });
    response.cookie('accessToken', accessToken, this.jwtService.getAccessTokenCookieOption());
    const { token: refreshToken } = await this.jwtService.generateRefreshToken({
      userId: userInfo.id,
      provider: 'kakao',
    });
    response.cookie('refreshToken', refreshToken, this.jwtService.getRefreshTokenCookieOption());
  }
}
