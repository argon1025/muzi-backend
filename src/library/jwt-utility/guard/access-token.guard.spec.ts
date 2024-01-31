import { UnauthorizedException } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard';
import { ERROR_CODE } from '../../exception/error.constant';

describe('AccessTokenGuard', () => {
  let accessTokenGuard: AccessTokenGuard;
  const jwtUtilityService = { validateAccessToken: jest.fn() };
  const reflector = { get: jest.fn() };

  beforeEach(() => {
    accessTokenGuard = new AccessTokenGuard(jwtUtilityService as any, reflector as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('유효한 액세스 토큰을 가지고 있을 경우 true를 반환한다.', async () => {
    // given
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ cookies: { accessToken: 'token' } }) }),
      getHandler: jest.fn(),
    };
    const userPayload = { userId: 'test', provider: 'test' };
    jwtUtilityService.validateAccessToken.mockReturnValue(userPayload);
    reflector.get.mockReturnValue(false);

    // when
    const result = await accessTokenGuard.canActivate(context as any);

    // then
    expect(result).toEqual(true);
  });

  it('유효하지 않은 액세스 토큰인 경우 UnauthorizedException을 반환한다.', async () => {
    // given
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ cookies: { accessToken: 'token' } }) }),
      getHandler: jest.fn(),
    };
    jwtUtilityService.validateAccessToken.mockRejectedValue(new Error());
    reflector.get.mockReturnValue(false);

    // when
    const result = accessTokenGuard.canActivate(context as any);

    // then
    const expectedError = new UnauthorizedException(ERROR_CODE.TOKEN_EXPIRED);
    await expect(result).rejects.toThrow(expectedError);
  });

  it('유효하지 않은 액세스 토큰을 가지고 있지만 토큰이 옵셔널일 경우 true를 반환한다', async () => {
    // given
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ cookies: { accessToken: 'token' } }) }),
      getHandler: jest.fn(),
    };
    jwtUtilityService.validateAccessToken.mockRejectedValue(new Error());
    reflector.get.mockReturnValue(true);

    // when
    const result = await accessTokenGuard.canActivate(context as any);

    // then
    expect(result).toEqual(true);
  });
});
