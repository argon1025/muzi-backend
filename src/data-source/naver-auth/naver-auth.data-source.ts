import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom, map, catchError, throwError } from 'rxjs';
import { INaverAuthDataSource } from './type/naver-auth.data-source.interface';
import { DataSourceException } from '../data-source.exception';
import { GetTokenResponse, GetUserInfoResponse, NaverAuthErrorResponse } from './type/naver-auth.type';

@Injectable()
export class NaverAuthDataSource implements INaverAuthDataSource.Base {
  private readonly NAVER_CLIENT_ID: string = this.configService.getOrThrow<string>('NAVER_CLIENT_ID');

  private readonly NAVER_CLIENT_SECRET: string = this.configService.getOrThrow<string>('NAVER_CLIENT_SECRET');

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getToken(options: INaverAuthDataSource.GetTokenOptions): Promise<INaverAuthDataSource.GetTokenResult> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: 'https://nid.naver.com/oauth2.0/token',
      params: {
        grant_type: 'authorization_code',
        client_id: this.NAVER_CLIENT_ID,
        client_secret: this.NAVER_CLIENT_SECRET,
        code: options.code,
        state: options.state,
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
      tokenType: result.token_type,
    };
  }

  async getUserInfo({ accessToken }: INaverAuthDataSource.GetUserInfoOptions): Promise<INaverAuthDataSource.GetUserInfoResult> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: 'https://openapi.naver.com/v1/nid/me',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const result = await lastValueFrom(
      this.httpService.request(config).pipe(
        map((response: AxiosResponse<GetUserInfoResponse>) => response.data),
        catchError((e) => throwError(() => this.errorHandler(e))),
      ),
    );

    return {
      id: result.response.id,
      email: result.response.email,
      name: result.response.name,
      nickname: result.response.nickname,
      gender: result.response.gender,
      birthday: result.response.birthday,
      profileImage: result.response.profile_image,
    };
  }

  /**
   * 에러 핸들러
   */
  private errorHandler(error: AxiosError<NaverAuthErrorResponse>) {
    const errorMessage = error.response?.data?.errorMessage || error.message || '요청한 서비스에 응답이 없습니다.';
    const naverErrorCode = error.response?.data?.errorCode;
    const statusCode = error.response?.status || 500;
    const requestConfig = error.config;
    throw new DataSourceException(`[${naverErrorCode}] ${errorMessage}`, statusCode, requestConfig);
  }
}
