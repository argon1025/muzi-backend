import { Controller, Inject, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JWT_UTILITY_SERVICE, IJwtUtilityService } from '../library/jwt-utility/type/jwt-utility.service.interface';
import { KakaoLoginRequest } from './dto/kakao-login.dto';
import { AUTH_SERVICE, IAuthService } from './type/auth.service.interface';
import { RefreshTokenGuard } from '../library/jwt-utility/guard/refresh-token.guard';
import { UserInfo } from '../library/jwt-utility/decorator/user-info.decorator';
import { ERROR_CODE, GenerateSwaggerDocumentByErrorCode } from '../library/exception/error.constant';

@Controller('auth')
@ApiTags('- 회원 가입')
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
  @ApiOperation({ summary: '카카오 로그인', description: '카카오 로그인을 진행합니다.' })
  @GenerateSwaggerDocumentByErrorCode([ERROR_CODE.GET_KAKAO_TOKEN_FAILED])
  async kakaoLogin(@Query() request: KakaoLoginRequest, @Res({ passthrough: true }) response: Response) {
    // 유저정보 조회
    const userInfo = await this.authService.loginForKakao({
      code: request.code,
      redirectUri: this.KAKAO_REDIRECT_URL,
    });

    // accessToken, refreshToken 토큰 발급
    const accessToken = await this.jwtService.generateAccessToken({
      userId: userInfo.id,
      provider: 'kakao',
    });
    response.cookie('accessToken', accessToken, this.jwtService.getAccessTokenCookieOption());
    const refreshToken = await this.jwtService.generateRefreshToken({
      userId: userInfo.id,
      provider: 'kakao',
    });
    response.cookie('refreshToken', refreshToken, this.jwtService.getRefreshTokenCookieOption());
  }

  @Get('logout')
  @ApiOperation({ summary: '로그아웃', description: '' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
  }

  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'AccessToken 재발급', description: 'RefreshToken을 사용하여 AccessToken을 재발급합니다.' })
  @ApiCookieAuth()
  @GenerateSwaggerDocumentByErrorCode([ERROR_CODE.TOKEN_EXPIRED])
  async refresh(@Res({ passthrough: true }) response: Response, @UserInfo() user: IJwtUtilityService.TokenPayload) {
    const accessToken = await this.jwtService.generateAccessToken({
      userId: user.userId,
      provider: user.provider,
    });
    response.cookie('accessToken', accessToken, this.jwtService.getAccessTokenCookieOption());
  }
}
