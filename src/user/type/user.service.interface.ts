export const USER_SERVICE = Symbol('USER_SERVICE');
/**
 * 외부 객체와 소통하는 UserService 인터페이스
 */
export namespace IUserService {
  export interface Base {
    loginForKakao(options: LoginForKakaoOptions): Promise<LoginForKakaoResult>;
  }

  export interface LoginForKakaoOptions {
    /** 카카오에서 리다이렉트한 인가코드 */
    code: string;
    /** 리 다이렉트 URL */
    redirectUri: string;
  }

  export interface LoginForKakaoResult {
    accessToken: string;
    refreshToken: string;
  }
}
