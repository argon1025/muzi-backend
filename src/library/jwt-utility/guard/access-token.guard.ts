import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IJwtUtilityService, JWT_UTILITY_SERVICE } from '../type/jwt-utility.service.interface';
import { AUTH_OPTIONAL } from '../decorator/auth-optional.decorator';
import { ERROR_CODE } from '../../exception/error.constant';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @Inject(JWT_UTILITY_SERVICE)
    private readonly jwtUtilityService: IJwtUtilityService.Base,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: IJwtUtilityService.TokenPayload }>();
    const isTokenOptional = this.isTokenOptional(context);
    const accessToken = this.getAccessToken(request);

    try {
      const payload = await this.jwtUtilityService.validateAccessToken(accessToken);
      request.user = payload;
      return true;
    } catch (error) {
      if (isTokenOptional) return true;
      throw new UnauthorizedException(ERROR_CODE.TOKEN_EXPIRED);
    }
  }

  private getAccessToken(request: Request): string {
    const accessToken = request.cookies.accessToken || '';
    return accessToken;
  }

  private isTokenOptional(context: ExecutionContext) {
    // metadata로 AUTH_OPTIONAL 값 추출
    return this.reflector.get<boolean>(AUTH_OPTIONAL, context.getHandler());
  }
}
