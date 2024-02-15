import { Controller, Inject, Get, Query, Res, UseGuards, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { JWT_UTILITY_SERVICE, IJwtUtilityService } from '../library/jwt-utility/type/jwt-utility.service.interface';
import { KakaoLoginRequest } from './dto/kakao-login.dto';
import { AUTH_SERVICE, IAuthService } from './type/auth.service.interface';
import { RefreshTokenGuard } from '../library/jwt-utility/guard/refresh-token.guard';
import { UserInfo } from '../library/jwt-utility/decorator/user-info.decorator';
import { ERROR_CODE, GenerateSwaggerDocumentByErrorCode } from '../library/exception/error.constant';
import { PostJoinWithUserIdRequest, PostJoinWithUserIdResponse } from './dto/post-join-with-user-id.dto';
import { UserLoginRequest, UserLoginResponse } from './dto/user-login.dto';
import { UserProvider } from './type/auth.type';
import { NaverLoginRequest } from './dto/naver-login.dto';

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

  @Post('userId/join')
  @ApiOperation({ summary: '유저 아이디 가입', description: '유저 아이디를 사용하여 가입합니다.' })
  @GenerateSwaggerDocumentByErrorCode([ERROR_CODE.USER_ALREADY_EXIST])
  async joinForUserId(@Body() request: PostJoinWithUserIdRequest) {
    await this.authService.joinForUserId(request);
    return plainToClass(PostJoinWithUserIdResponse, { success: true });
  }

  @Post('userId/login')
  @ApiOperation({ summary: '유저 아이디 로그인', description: '유저 아이디를 사용하여 로그인합니다.' })
  @GenerateSwaggerDocumentByErrorCode([ERROR_CODE.USER_NOT_FOUND])
  async loginForUserId(@Body() { userId, password }: UserLoginRequest, @Res({ passthrough: true }) response: Response) {
    // 유저정보 조회
    const userInfo = await this.authService.loginForUserId({ userId, password });

    // accessToken, refreshToken 토큰 발급
    const accessToken = await this.jwtService.generateAccessToken({
      userId: userInfo.id,
      provider: UserProvider.USER_ID,
    });
    const refreshToken = await this.jwtService.generateRefreshToken({
      userId: userInfo.id,
      provider: UserProvider.USER_ID,
    });
    response.cookie('accessToken', accessToken, this.jwtService.getAccessTokenCookieOption());
    response.cookie('refreshToken', refreshToken, this.jwtService.getRefreshTokenCookieOption());
    return plainToClass(UserLoginResponse, { success: true });
  }

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
      provider: UserProvider.KAKAO,
    });
    response.cookie('accessToken', accessToken, this.jwtService.getAccessTokenCookieOption());
    const refreshToken = await this.jwtService.generateRefreshToken({
      userId: userInfo.id,
      provider: UserProvider.KAKAO,
    });
    response.cookie('refreshToken', refreshToken, this.jwtService.getRefreshTokenCookieOption());
  }

  @Get('naver')
  @ApiOperation({ summary: '네이버 로그인', description: '네이버 로그인을 진행합니다.' })
  @GenerateSwaggerDocumentByErrorCode([ERROR_CODE.GET_NAVER_TOKEN_FAILED])
  async naverLogin(@Query() request: NaverLoginRequest, @Res({ passthrough: true }) response: Response) {
    // 유저정보 조회
    const userInfo = await this.authService.loginForNaver({ code: request.code, state: request.state });

    // accessToken, refreshToken 토큰 발급
    const accessToken = await this.jwtService.generateAccessToken({
      userId: userInfo.id,
      provider: UserProvider.NAVER,
    });
    response.cookie('accessToken', accessToken, this.jwtService.getAccessTokenCookieOption());
    const refreshToken = await this.jwtService.generateRefreshToken({
      userId: userInfo.id,
      provider: UserProvider.NAVER,
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
