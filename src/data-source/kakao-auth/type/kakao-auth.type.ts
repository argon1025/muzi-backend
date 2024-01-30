/**
 * 내부에서만 사용되는 kakao-auth.data-source 타입 정의
 */

/**
 * https://kauth.kakao.com/oauth/token
 * GetToken API 응답 타입
 */
export interface GetTokenResponse {
  token_type: 'bearer';
  /** 사용자 액세스 토큰 값 */
  access_token: string;
  /** OpenID Connect 확장 기능을 통해 발급되는 ID 토큰 */
  id_token?: string;
  /** 액세스 토큰과 ID 토큰의 만료 시간(초) */
  expires_in: number;
  /** 사용자 리프레시 토큰 값 */
  refresh_token: string;
  /** 리프레시 토큰 만료 시간(초) */
  refresh_token_expires_in: number;
  /** 인증된 사용자의 정보 조회 권한 범위 */
  scope?: string;
}

/**
 * https://kapi.kakao.com/v2/user/me
 * GetUserInfo API 응답 타입
 */
export interface GetUserInfoResponse {
  /** 카카오 고유 아이디 */
  id: number;
  /** 연결 일자 */
  connected_at?: string;
  kakao_account?: {
    /** 카카오 계정 이름 */
    name?: string;
    /** 카카오 계정 대표 이메일 */
    email?: string;
    /** 이메일 유효 여부 */
    is_email_valid?: boolean;
    /** 이메일 인증 여부 */
    is_email_verified?: boolean;
    /** 출생 연도(YYYY 형식) */
    birthyear?: string;
    /** 생일(MMDD 형식) */
    birthday?: string;
    /** 성별 */
    gender?: 'female' | 'male';
    profile?: {
      /** 닉네임 */
      nickname?: string;
      /** 프로필 이미지 URL */
      profile_image_url?: string;
    };
  };
}

/**
 * 카카오 exception Error Response 타입
 */
export interface KakaoAuthErrorResponse {
  error: string;
  error_description: string;
  error_code: string;
}
