import { Injectable } from '@nestjs/common';
import { IUserRepository } from './type/user.repository.interface';
import { PrismaService } from '../library/prisma/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository.Base {
  constructor(private readonly prismaService: PrismaService) {}

  findOne(options: IUserRepository.FindOneOptions): Promise<IUserRepository.User | null> {
    return this.prismaService.user.findUnique({
      where: {
        id: options.id,
        kakaoId: options.kakaoId,
        deletedAt: null,
      },
    });
  }

  create(options: IUserRepository.CreateUserOptions): Promise<IUserRepository.User> {
    return this.prismaService.user.create({
      data: {
        provider: options.provider,
        nickname: options.nickname,
        kakaoId: options.kakaoId,
        email: options.email,
        profile: options.profile,
      },
    });
  }
}
