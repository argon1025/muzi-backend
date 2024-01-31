import { UnauthorizedException } from '@nestjs/common';
import { ERROR_CODE } from '../../exception/error.constant';
import { RefreshTokenGuard } from './refresh-token.guard';

describe('RefreshTokenGuard', () => {
  let refreshTokenGuard: RefreshTokenGuard;
  const jwtUtilityService = { validateRefreshToken: jest.fn() };

  beforeEach(() => {
    refreshTokenGuard = new RefreshTokenGuard(jwtUtilityService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('유효한 리프레시 토큰을 가지고 있을 경우 true를 반환한다.', async () => {
    // given
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ cookies: { accessToken: 'token' } }) }),
    };
    const userPayload = { userId: 'test', provider: 'test' };
    jwtUtilityService.validateRefreshToken.mockReturnValue(userPayload);

    // when
    const result = await refreshTokenGuard.canActivate(context as any);

    // then
    expect(result).toEqual(true);
  });

  it('유효하지 않은 리프레시 토큰인 경우 UnauthorizedException을 반환한다.', async () => {
    // given
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ cookies: { accessToken: 'token' } }) }),
    };
    jwtUtilityService.validateRefreshToken.mockRejectedValue(new Error());

    // when
    const result = refreshTokenGuard.canActivate(context as any);

    // then
    const expectedError = new UnauthorizedException(ERROR_CODE.TOKEN_EXPIRED);
    await expect(result).rejects.toThrow(expectedError);
  });
});
