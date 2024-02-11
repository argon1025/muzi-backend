import { Injectable, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { IUserService } from './type/user.service.interface';
import { ERROR_CODE } from '../library/exception/error.constant';
import { PrismaService } from '../library/prisma/prisma.service';

@Injectable()
export class UserService implements IUserService.Base {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserById(userId: string): Promise<IUserService.GetUserByIdResult> {
    const userInfo = await this.prismaService.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!userInfo) throw new NotFoundException(ERROR_CODE.USER_NOT_FOUND);

    return userInfo;
  }

  async deleteUserById(options: IUserService.DeleteUserByIdOptions): Promise<void> {
    const { userId } = options;
    // 이미 삭제된 사용자인지 확인
    const userInfo = await this.prismaService.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!userInfo) throw new NotFoundException(ERROR_CODE.USER_NOT_FOUND);

    await this.prismaService.user.update({ where: { id: userId }, data: { deletedAt: DateTime.utc().toJSDate() } });
  }
}
