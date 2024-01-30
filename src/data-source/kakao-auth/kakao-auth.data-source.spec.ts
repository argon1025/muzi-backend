import * as AxiosMockAdapter from 'axios-mock-adapter';
import { HttpService } from '@nestjs/axios';
import { KakaoAuthDataSource } from './kakao-auth.data-source';
import { GetTokenResponse, GetUserInfoResponse } from './type/kakao-auth.type';

describe('kakao-auth.data-source', () => {
  let kakaoAuthDataSource: KakaoAuthDataSource;
  const httpServiceStub = new HttpService();
  const axiosMockAdapter = new AxiosMockAdapter(httpServiceStub.axiosRef);
  const configServiceStub = { getOrThrow: jest.fn() } as any;

  beforeEach(async () => {
    kakaoAuthDataSource = new KakaoAuthDataSource(httpServiceStub, configServiceStub);
  });

  afterEach(() => {
    axiosMockAdapter.reset();
  });

  describe('getToken', () => {
    it('정상적으로 토큰을 발급 받았을 경우.', async () => {
      // given
      const response: GetTokenResponse = {
        token_type: 'bearer',
        access_token: 'access_token',
        expires_in: 21599,
        refresh_token: 'refresh_token',
        refresh_token_expires_in: 5183999,
      };
      axiosMockAdapter.onPost('https://kauth.kakao.com/oauth/token').reply(200, response);

      // when
      const result = await kakaoAuthDataSource.getToken({
        code: 'code',
        redirectUri: 'redirectUri',
      });

      // then
      expect(result).toEqual({
        accessToken: 'access_token',
        expiresIn: 21599,
        refreshToken: 'refresh_token',
        refreshTokenExpiresIn: 5183999,
        tokenType: 'bearer',
      });
    });

    it('토큰 발급 요청이 실패했을 경우 에러코드 정보와 함께 DataSourceException를 반환한다.', async () => {
      // given
      const kakaoError = { error_code: 'KOE001', error_description: '잘못된 형식의 요청', error: 'invalid_grant' };
      axiosMockAdapter.onPost('https://kauth.kakao.com/oauth/token').reply(400, kakaoError);

      // when
      const result = kakaoAuthDataSource.getToken({
        code: 'code',
        redirectUri: 'redirectUri',
      });

      // then
      await expect(result).rejects.toThrow('KOE001');
    });
  });

  describe('getUserInfo', () => {
    it('유저 정보를 정상적으로 수신했을 경우.', async () => {
      // given
      const response: GetUserInfoResponse = {
        id: 123456789,
        connected_at: '2021-08-16T09:00:00Z',
        kakao_account: {
          name: '홍길동',
          email: 'hong@gmail.com',
          is_email_valid: true,
          is_email_verified: true,
          birthyear: '1990',
          birthday: '0101',
          gender: 'female',
          profile: {
            nickname: '홍길동',
            profile_image_url: 'https://k.kakaocdn.net/dn/abcde',
          },
        },
      };
      axiosMockAdapter.onGet('https://kapi.kakao.com/v2/user/me').reply(200, response);

      // when
      const result = await kakaoAuthDataSource.getUserInfo({ accessToken: 'accessToken' });

      // then
      expect(result).toEqual({
        id: 123456789,
        connectedAt: '2021-08-16T09:00:00Z',
        profileImage: 'https://k.kakaocdn.net/dn/abcde',
        name: '홍길동',
        email: 'hong@gmail.com',
      });
    });

    it('토큰 발급 요청이 실패했을 경우 에러코드 정보와 함께 DataSourceException를 반환한다.', async () => {
      // given
      const kakaoError = {
        error_code: 'access_denied',
        error_description: '사용자가 로그인을 취소했습니다.',
        error: 'User denied access',
      };
      axiosMockAdapter.onGet('https://kapi.kakao.com/v2/user/me').reply(404, kakaoError);

      // when
      const result = kakaoAuthDataSource.getUserInfo({ accessToken: 'accessToken' });

      // then
      await expect(result).rejects.toThrow('access_denied');
    });
  });
});
