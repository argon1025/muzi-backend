export const JWT_UTILITY_SERVICE = Symbol('JWT_UTILITY_SERVICE');

/**
 * 외부 객체와 소통하기 위한 JwtUtilityService 인터페이스
 */
export namespace IJwtUtilityService {
  export interface Base {
    /** Access 토큰 생성 */
    generateAccessToken(payload: TokenPayload): Promise<string>;

    /** Refresh 토큰 생성 */
    generateRefreshToken(payload: TokenPayload): Promise<string>;

    /** Access 토큰 복호화 */
    validateAccessToken(token: string): Promise<TokenPayload>;

    /** Refresh 토큰 복호화 */
    validateRefreshToken(token: string): Promise<TokenPayload>;
  }

  export interface TokenPayload {
    userId: string;
    provider: string;
  }
}
