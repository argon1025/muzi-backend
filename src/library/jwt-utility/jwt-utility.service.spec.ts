import { TokenExpiredError } from '@nestjs/jwt';
import { JwtUtilityService } from './jwt-utility.service';
import { IJwtUtilityService } from './type/jwt-utility.service.interface';
import { JwtUtilityException } from './jwt-utility.exception';

describe('JwtUtilityService', () => {
  const configServiceStub = { getOrThrow: jest.fn() } as any;
  const jwtServiceStub = { signAsync: jest.fn(), verifyAsync: jest.fn() } as any;
  const jwtUtilityService = new JwtUtilityService(configServiceStub, jwtServiceStub);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('페이로드를 받아서 AccessToken을 생성한다.', async () => {
      // given
      const payload: IJwtUtilityService.TokenPayload = { userId: '1', provider: 'test' };
      configServiceStub.getOrThrow.mockReturnValue('test');
      jwtServiceStub.signAsync.mockReturnValueOnce('test');

      // when
      const result = await jwtUtilityService.generateAccessToken(payload);

      // then
      expect(result.token).toBe('test');
    });
  });

  describe('generateRefreshToken', () => {
    it('페이로드를 받아서 RefreshToken을 생성한다.', async () => {
      // given
      const payload: IJwtUtilityService.TokenPayload = { userId: '1', provider: 'test' };
      configServiceStub.getOrThrow.mockReturnValue('test');
      jwtServiceStub.signAsync.mockReturnValueOnce('test');

      // when
      const result = await jwtUtilityService.generateRefreshToken(payload);

      // then
      expect(result.token).toBe('test');
    });
  });

  describe('validateAccessToken', () => {
    it('AccessToken을 받아서 페이로드를 반환한다.', async () => {
      // given
      const payload: IJwtUtilityService.TokenPayload = { userId: '1', provider: 'test' };
      configServiceStub.getOrThrow.mockReturnValue('test');
      jwtServiceStub.verifyAsync.mockReturnValueOnce(payload);

      // when
      const result = await jwtUtilityService.validateAccessToken('test');

      // then
      expect(result).toEqual(payload);
    });

    it('AccessToken이 만료되었을 경우, JwtUtilityException TokenExpiredError에러를 전달한다.', async () => {
      // given
      const error = new TokenExpiredError('TokenExpiredError', new Date());
      const expectError = new JwtUtilityException('TokenExpiredError', error);
      configServiceStub.getOrThrow.mockReturnValue('test');
      jwtServiceStub.verifyAsync.mockRejectedValueOnce(error);

      // when
      const result = jwtUtilityService.validateAccessToken('test');

      // then
      await expect(result).rejects.toThrow(expectError);
    });

    it('AccessToken이 유효하지 않을 경우, JwtUtilityException validateFailRefreshToken에러를 전달한다.', async () => {
      // given
      const error = new Error('test');
      const expectError = new JwtUtilityException('validateFailAccessToken', error);
      configServiceStub.getOrThrow.mockReturnValue('test');
      jwtServiceStub.verifyAsync.mockRejectedValueOnce(error);

      // when
      const result = jwtUtilityService.validateAccessToken('test');

      // then
      await expect(result).rejects.toThrow(expectError);
    });
  });

  describe('validateRefreshToken', () => {
    it('RefreshToken을 받아서 페이로드를 반환한다.', async () => {
      // given
      const payload: IJwtUtilityService.TokenPayload = { userId: '1', provider: 'test' };
      configServiceStub.getOrThrow.mockReturnValue('test');
      jwtServiceStub.verifyAsync.mockReturnValueOnce(payload);

      // when
      const result = await jwtUtilityService.validateRefreshToken('test');

      // then
      expect(result).toEqual(payload);
    });

    it('RefreshToken이 만료되었을 경우, JwtUtilityException TokenExpiredError에러를 전달한다.', async () => {
      // given
      const error = new TokenExpiredError('TokenExpiredError', new Date());
      const expectError = new JwtUtilityException('TokenExpiredError', error);
      configServiceStub.getOrThrow.mockReturnValue('test');
      jwtServiceStub.verifyAsync.mockRejectedValueOnce(error);

      // when
      const result = jwtUtilityService.validateRefreshToken('test');

      // then
      await expect(result).rejects.toThrow(expectError);
    });

    it('RefreshToken이 유효하지 않을 경우, JwtUtilityException validateFailRefreshToken에러를 전달한다.', async () => {
      // given
      const error = new Error('test');
      const expectError = new JwtUtilityException('validateFailRefreshToken', error);
      configServiceStub.getOrThrow.mockReturnValue('test');
      jwtServiceStub.verifyAsync.mockRejectedValueOnce(error);

      // when
      const result = jwtUtilityService.validateRefreshToken('test');

      // then
      await expect(result).rejects.toThrow(expectError);
    });
  });
});
