import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom, map, catchError, throwError } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { IKakaoAuthDataSource } from './type/kakao-auth.data-source.interface';
import { DataSourceException } from '../data-source.exception';
import { GetTokenResponse, GetUserInfoResponse, KakaoAuthErrorResponse } from './type/kakao-auth.type';

@Injectable()
export class KakaoAuthDataSource implements IKakaoAuthDataSource.Base {
  private readonly KAKAO_CLIENT_ID: string = this.configService.getOrThrow<string>('KAKAO_CLIENT_ID');

  private readonly KAKAO_CLIENT_SECRET: string = this.configService.getOrThrow<string>('KAKAO_CLIENT_SECRET');

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getToken(options: IKakaoAuthDataSource.GetTokenOptions): Promise<IKakaoAuthDataSource.GetTokenResult> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: 'https://kauth.kakao.com/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      data: {
        grant_type: 'authorization_code',
        client_id: this.KAKAO_CLIENT_ID,
        redirect_uri: options.redirectUri,
        code: options.code,
        client_secret: this.KAKAO_CLIENT_SECRET,
      },
    };
    const result = await lastValueFrom(
      this.httpService.request(config).pipe(
        map((response: AxiosResponse<GetTokenResponse>) => response.data),
        catchError((e) => throwError(() => this.errorHandler(e))),
      ),
    );

    return {
      accessToken: result.access_token,
      expiresIn: result.expires_in,
      refreshToken: result.refresh_token,
      refreshTokenExpiresIn: result.refresh_token_expires_in,
      tokenType: result.token_type,
    };
  }

  async getUserInfo(options: IKakaoAuthDataSource.GetUserInfoOptions): Promise<IKakaoAuthDataSource.GetUserInfoResult> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
      },
    };

    const result = await lastValueFrom(
      this.httpService.request(config).pipe(
        map((response: AxiosResponse<GetUserInfoResponse>) => response.data),
        catchError((e) => throwError(() => this.errorHandler(e))),
      ),
    );

    return {
      id: result.id,
      connectedAt: result.connected_at,
      profileImage: result.kakao_account?.profile?.profile_image_url,
      name: result.kakao_account?.profile?.nickname,
      email: result.kakao_account?.email,
    };
  }

  /**
   * 에러 핸들러
   */
  private errorHandler(error: AxiosError<KakaoAuthErrorResponse>) {
    const errorMessage = error.response?.data?.error_code || error.message || '요청한 서비스에 응답이 없습니다.';
    const statusCode = error.response?.status || 500;
    const requestConfig = error.config;
    throw new DataSourceException(errorMessage, statusCode, requestConfig);
  }
}
