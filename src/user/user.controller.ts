import { Controller, Get, Inject, UseGuards } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UserInfo } from '../library/jwt-utility/decorator/user-info.decorator';
import { IJwtUtilityService } from '../library/jwt-utility/type/jwt-utility.service.interface';
import { AccessTokenGuard } from '../library/jwt-utility/guard/access-token.guard';
import { ERROR_CODE, GenerateSwaggerDocumentByErrorCode } from '../library/exception/error.constant';
import { IUserService, USER_SERVICE } from './type/user.service.interface';
import { GetUserByIdResponse } from './dto/get-user-by-id.dto';

@Controller('user')
@ApiTags('- 회원')
@UseGuards(AccessTokenGuard)
export class UserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService.Base,
  ) {}

  @Get()
  @ApiOperation({ summary: '로그인된 회원 상세 정보 조회' })
  @GenerateSwaggerDocumentByErrorCode([ERROR_CODE.USER_NOT_FOUND])
  async getUser(@UserInfo() user: IJwtUtilityService.TokenPayload) {
    return plainToInstance(GetUserByIdResponse, await this.userService.getUserById(user.userId));
  }
}
