export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
/**
 * 외부 객체와 소통하는 AuthService 인터페이스
 */
export namespace IAuthService {
  export interface Base {
    /** 카카오 인가코드를 통해 가입 & 로그인 */
    loginForKakao(options: LoginForKakaoOptions): Promise<LoginForKakaoResult>;
    /** 유저 아이디로 자사 회원가입 */
    joinForUserId(options: JoinForUserIdOptions): Promise<void>;
    /** 유저 아이디로 로그인 */
    loginForUserId(options: LoginForUserIdOptions): Promise<LoginForUserIdResult>;
    /** 네이버 인가코드를 통해 가입 & 로그인 */
    loginForNaver(options: LoginForNaverOptions): Promise<LoginForNaverResult>;
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

  export interface JoinForUserIdOptions {
    userId: string;
    password: string;
    nickname: string;
    email?: string;
    profile?: string;
  }

  export interface LoginForUserIdOptions {
    userId: string;
    password: string;
  }

  export interface LoginForUserIdResult {
    id: string;
    /** 유저 아이디 */
    userId: string;
    /** 가입 유형 */
    provider: string;
    /** 별명 */
    nickname: string;
    /** 이메일 */
    email?: string;
    /** 프로파일 이미지 */
    profile?: string;
    /** 삭제일 */
    deletedAt?: Date;
    updatedAt: Date;
    createdAt: Date;
  }

  export interface LoginForNaverOptions {
    /** 네이버 인가 코드 */
    code: string;
    /** 인가 코드가 리다이렉트된 URI */
    state: string;
  }

  export interface LoginForNaverResult {
    id: string;
    /** 가입 유형 */
    provider: string;
    /** 별명 */
    nickname: string;
    /** 네이버 고유 키 */
    naverId?: string | null;
    /** 이메일 */
    email?: string | null;
    /** 프로파일 이미지 */
    profile?: string | null;
    /** 삭제일 */
    deletedAt?: Date | null;
    updatedAt: Date;
    createdAt: Date;
  }
}
