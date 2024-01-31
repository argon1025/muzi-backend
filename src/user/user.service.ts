import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserService } from './type/user.service.interface';
import { USER_REPOSITORY } from './type/user.repository.interface';
import { ERROR_CODE } from '../library/exception/error.constant';

@Injectable()
export class UserService implements IUserService.Base {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserService.Base,
  ) {}

  async getUserById(userId: string): Promise<IUserService.GetUserByIdResult> {
    const userInfo = await this.userRepository.getUserById(userId);
    if (!userInfo) throw new NotFoundException(ERROR_CODE.USER_NOT_FOUND);

    return userInfo;
  }
}
