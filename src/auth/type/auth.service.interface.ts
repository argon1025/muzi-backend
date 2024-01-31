export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
/**
 * 외부 객체와 소통하는 AuthService 인터페이스
 */
export namespace IAuthService {
  export interface Base {
    loginForKakao(options: LoginForKakaoOptions): Promise<LoginForKakaoResult>;
  }

  export interface LoginForKakaoResult {
    id: string;
    /** 가입 유형 */
    provider: string;
    /** 별명 */
    nickname: string;
    /** 카카오 고유 키 */
    kakaoId?: string | null;
    /** 이메일 */
    email?: string | null;
    /** 프로파일 이미지 */
    profile?: string | null;
    /** 삭제일 */
    deletedAt?: Date | null;
    updatedAt: Date;
    createdAt: Date;
  }

  export interface LoginForKakaoOptions {
    /** 카카오에서 리다이렉트한 인가코드 */
    code: string;
    /** 리 다이렉트 URL */
    redirectUri: string;
  }
}
