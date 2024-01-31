import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { IJwtUtilityService, JWT_UTILITY_SERVICE } from '../type/jwt-utility.service.interface';
import { ERROR_CODE } from '../../exception/error.constant';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    @Inject(JWT_UTILITY_SERVICE)
    private readonly jwtUtilityService: IJwtUtilityService.Base,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: IJwtUtilityService.TokenPayload }>();
    const refreshToken = this.getRefreshToken(request);

    try {
      const payload = await this.jwtUtilityService.validateRefreshToken(refreshToken);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(ERROR_CODE.TOKEN_EXPIRED);
    }
  }

  private getRefreshToken(request: Request): string {
    const refreshToken = request.cookies.refreshToken || '';
    return refreshToken;
  }
}
