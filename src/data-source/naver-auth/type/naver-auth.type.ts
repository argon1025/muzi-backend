/**
 * naver-auth 내부에서 사용되는 타입
 */

export interface GetTokenResponse {
  access_token: string;
  expires_in: string;
  refresh_token: string;
  token_type: 'bearer' | 'mac';
}

export interface GetUserInfoResponse {
  /** API 호출 결과 코드 */
  resultcode: string;
  /** 호출 결과 메시지 */
  message: string;
  response: {
    /** 네이버 아이디마다 고유하게 발급되는 유니크한 일련번호 값 */
    id: string;
    /** 사용자 별명 (설정되어 있지 않으면 id*** 형태) */
    nickname: string;
    /** 사용자 이름 */
    name: string;
    /** 사용자 이메일 */
    email: string;
    /** 성별 F: 여성 / M: 남성 / U: 확인불가 */
    gender: 'M' | 'F' | 'U';
    /** 연령대 */
    age: string;
    /** 생일 (MM-DD 형식) */
    birthday: string;
    /** 프로필 이미지 URL */
    profile_image: string;
    /** 출생연도 */
    birthyear: string;
    /** 휴대전화 번호 */
    mobile: string;
  };
}

export interface NaverAuthErrorResponse {
  errorMessage: string;
  errorCode: string;
}
