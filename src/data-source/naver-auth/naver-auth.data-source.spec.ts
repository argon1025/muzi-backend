import * as AxiosMockAdapter from 'axios-mock-adapter';
import { HttpService } from '@nestjs/axios';
import { NaverAuthDataSource } from './naver-auth.data-source';
import { GetTokenResponse, GetUserInfoResponse, NaverAuthErrorResponse } from './type/naver-auth.type';
import { DataSourceException } from '../data-source.exception';

describe('kakao-auth.data-source', () => {
  let naverAuthDataSource: NaverAuthDataSource;
  const httpServiceStub = new HttpService();
  const axiosMockAdapter = new AxiosMockAdapter(httpServiceStub.axiosRef);
  const configServiceStub = { getOrThrow: jest.fn() } as any;

  beforeEach(async () => {
    naverAuthDataSource = new NaverAuthDataSource(httpServiceStub, configServiceStub);
  });

  afterEach(() => {
    axiosMockAdapter.reset();
  });

  describe('getToken', () => {
    it('정상적으로 토큰을 발급 받았을 경우.', async () => {
      // given
      const response: GetTokenResponse = {
        access_token: 'AAAAQosjWDJieBiQZc3to9YQp6HDLvrmyKC+6+iZ3gq7qrkqf50ljZC+Lgoqrg',
        refresh_token: 'c8ceMEJisO4Se7uGisHoX0f5JEii7JnipglQipkOn5Zp3tyP7dHQoP0zNKHUq2gY',
        token_type: 'bearer',
        expires_in: '3600',
      };
      axiosMockAdapter.onPost('https://nid.naver.com/oauth2.0/token').reply(200, response);

      // when
      const result = await naverAuthDataSource.getToken({
        code: 'code',
        state: 'state',
      });

      // then
      expect(result.accessToken).toEqual(response.access_token);
      expect(result.expiresIn).toEqual(response.expires_in);
      expect(result.refreshToken).toEqual(response.refresh_token);
      expect(result.tokenType).toEqual(response.token_type);
    });
    it('토큰 발급 요청이 실패했을 경우 에러코드 정보와 함께 DataSourceException를 반환한다.', async () => {
      // given
      const errorResponse: NaverAuthErrorResponse = {
        errorMessage: 'Authentication failed (인증에 실패하였습니다.)',
        errorCode: '024',
      };
      const errorCode = 400;
      axiosMockAdapter.onPost('https://nid.naver.com/oauth2.0/token').reply(errorCode, errorResponse);

      // when
      const result = naverAuthDataSource.getToken({
        code: 'code',
        state: 'state',
      });

      // then
      await expect(result).rejects.toThrow(`[${errorResponse.errorCode}] ${errorResponse.errorMessage}`);
      expect(result).rejects.toBeInstanceOf(DataSourceException);
    });
  });

  describe('getUserInfo', () => {
    it('정상적으로 사용자 정보를 가져왔을 경우.', async () => {
      // given
      const response: GetUserInfoResponse = {
        resultcode: '00',
        message: 'success',
        response: {
          email: 'openapi@naver.com',
          nickname: 'OpenAPI',
          profile_image: 'https://ssl.pstatic.net/static/pwe/address/nodata_33x33.gif',
          age: '40-49',
          gender: 'F',
          id: '32742776',
          name: '오픈 API',
          birthday: '10-01',
          birthyear: '1900',
          mobile: '010-0000-0000',
        },
      };
      axiosMockAdapter.onGet('https://openapi.naver.com/v1/nid/me').reply(200, response);

      // when
      const result = await naverAuthDataSource.getUserInfo({ accessToken: 'access_token' });

      // then
      expect(result.id).toEqual(response.response.id);
      expect(result.email).toEqual(response.response.email);
      expect(result.name).toEqual(response.response.name);
      expect(result.nickname).toEqual(response.response.nickname);
      expect(result.gender).toEqual(response.response.gender);
      expect(result.birthday).toEqual(response.response.birthday);
      expect(result.profileImage).toEqual(response.response.profile_image);
    });
    it('사용자 정보 요청이 실패했을 경우 에러코드 정보와 함께 DataSourceException를 반환한다.', async () => {
      // given
      const errorResponse: NaverAuthErrorResponse = {
        errorMessage: 'Authentication failed (인증에 실패하였습니다.)',
        errorCode: '024',
      };
      const errorCode = 400;
      axiosMockAdapter.onGet('https://openapi.naver.com/v1/nid/me').reply(errorCode, errorResponse);

      // when
      const result = naverAuthDataSource.getUserInfo({ accessToken: 'access_token' });

      // then
      await expect(result).rejects.toThrow(`[${errorResponse.errorCode}] ${errorResponse.errorMessage}`);
      expect(result).rejects.toBeInstanceOf(DataSourceException);
    });
  });
});
