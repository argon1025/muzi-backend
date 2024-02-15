export const NAVER_AUTH_DATA_SOURCE = Symbol('NAVER_AUTH_DATA_SOURCE');

/**
 * 외부 객체와 소통하는 NaverAuthDataSource 인터페이스
 */
export namespace INaverAuthDataSource {
  export interface Base {
    /**
     * 인가코드를 기반으로 액세스 토큰을 발급받는다.
     * [naverDocs](https://developers.naver.com/docs/login/api/api.md#3-2--%EC%A0%91%EA%B7%BC-%ED%86%A0%ED%81%B0-%EB%B0%9C%EA%B8%89%EA%B0%B1%EC%8B%A0%EC%82%AD%EC%A0%9C-%EC%9A%94%EC%B2%AD)
     */
    getToken(options: GetTokenOptions): Promise<GetTokenResult>;

    /**
     * 토큰을 기반으로 사용자 정보를 가져온다.
     * [naverDocs](https://developers.naver.com/docs/login/profile/profile.md)
     */
    getUserInfo(options: GetUserInfoOptions): Promise<GetUserInfoResult>;
  }

  export interface GetTokenOptions {
    /** 네이버 인가 코드 */
    code: string;
    /** 인가 코드가 리다이렉트된 URI */
    state: string;
  }

  export interface GetTokenResult {
    /** 액세스 토큰 */
    accessToken: string;
    /** 액세스 토큰 만료 시간(초) */
    expiresIn: string;
    /** 리프레시 토큰 */
    refreshToken: string;
    /** 액세스 토큰 타입 */
    tokenType: 'bearer' | 'mac';
  }

  export interface GetUserInfoOptions {
    /** 액세스 토큰 */
    accessToken: string;
  }

  export interface GetUserInfoResult {
    /** 네이버 고유 아이디 */
    id: string;
    /** 이메일 */
    email: string;
    /** 이름 */
    name: string;
    /** 사용자 별명 */
    nickname: string;
    /** 성별 F: 여성, M: 남성, U: 확인불가 */
    gender: 'M' | 'F' | 'U';
    /** 생일 MM-DD */
    birthday: string;
    /** 프로필 이미지 */
    profileImage: string;
  }
}
