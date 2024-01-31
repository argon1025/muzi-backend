import { SetMetadata } from '@nestjs/common';

/**
 * 토큰을 제공할 수는 있지만 필수는 아닌 경우에 사용합니다.
 * 1. 토큰을 제공하는 경우 -> user 정보 전달
 * 2. 토큰을 제공하지 않는 경우 -> user 정보를 null로 전달
 */
export const AUTH_OPTIONAL = Symbol('AUTH_OPTIONAL');
export const AuthOptional = () => SetMetadata(AUTH_OPTIONAL, true);
