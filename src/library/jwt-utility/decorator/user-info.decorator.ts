import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { IJwtUtilityService } from '../type/jwt-utility.service.interface';

export const UserInfo = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request & { user: IJwtUtilityService.TokenPayload }>();
  const payload = request.user;
  return payload || null;
});
