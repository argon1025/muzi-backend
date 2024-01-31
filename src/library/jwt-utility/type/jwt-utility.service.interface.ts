export const JWT_UTILITY_SERVICE = Symbol('JWT_UTILITY_SERVICE');

/**
 * 외부 객체와 소통하기 위한 JwtUtilityService 인터페이스
 */
export namespace IJwtUtilityService {
  export interface Base {
    /** AccessToken 토큰 생성 */
    generateAccessToken(payload: TokenPayload): Promise<string>;

    /** RefreshToken 토큰 생성 */
    generateRefreshToken(payload: TokenPayload): Promise<string>;

    /** AccessToken 토큰 복호화 */
    validateAccessToken(token: string): Promise<TokenPayload>;

    /** RefreshToken 토큰 복호화 */
    validateRefreshToken(token: string): Promise<TokenPayload>;

    /** AccessToken 쿠키옵션 조회 */
    getAccessTokenCookieOption(): GetCookieOptionResult;

    /** RefreshToken 쿠키옵션 조회 */
    getRefreshTokenCookieOption(): GetCookieOptionResult;
  }

  export interface TokenPayload {
    userId: string;
    provider: string;
  }

  export interface GetCookieOptionResult {
    domain: string;
    path: string;
    httpOnly: boolean;
    secure: boolean;
    maxAge?: number;
  }
}
