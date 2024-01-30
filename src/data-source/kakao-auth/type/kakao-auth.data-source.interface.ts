export const KAKAO_AUTH_DATA_SOURCE = Symbol('KAKAO_AUTH_DATA_SOURCE');

/**
 * 외부 객체와 소통하는 KakaoAuthDataSource 인터페이스
 */
export namespace IKakaoAuthDataSource {
  /**
   * 추상화된 KakaoAuthDataSource 인터페이스
   */
  export interface Base {
    /**
     * 인가코드를 기반으로 액세스 토큰을 발급받는다.
     * [kakaoDocs](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-code)
     */
    getToken(options: GetTokenOptions): Promise<GetTokenResult>;
    /**
     * 토큰을 기반으로 사용자 정보를 가져온다.
     * [kakaoDocs](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#req-user-info)
     */
    getUserInfo(options: GetUserInfoOptions): Promise<GetUserInfoResult>;
  }

  export interface GetTokenOptions {
    /** 카카오 인가 코드 */
    code: string;
    /** 인가 코드가 리다이렉트된 URI */
    redirectUri: string;
  }

  export interface GetTokenResult {
    /** 액세스 토큰 */
    accessToken: string;
    /** 액세스 토큰 만료 시간(초) */
    expiresIn: number;
    /** 리프레시 토큰 */
    refreshToken: string;
    /** 리프레시 토큰 만료 시간(초) */
    refreshTokenExpiresIn: number;
    /** 액세스 토큰 타입 */
    tokenType: 'bearer';
  }

  export interface GetUserInfoOptions {
    /** 액세스 토큰 */
    accessToken: string;
  }

  export interface GetUserInfoResult {
    /** 카카오 고유 아이디 */
    id: number;
    /** 연결 일자 */
    connectedAt?: string;
    /** 프로필 이미지 */
    profileImage?: string;
    /** 이름 */
    name?: string;
    /** 이메일 */
    email?: string;
  }
}
