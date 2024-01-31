import { Injectable } from '@nestjs/common';
import { PrismaService } from '../library/prisma/prisma.service';
import { IAuthRepository } from './type/auth.repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository.Base {
  constructor(private readonly prismaService: PrismaService) {}

  findOne(options: IAuthRepository.FindOneOptions): Promise<IAuthRepository.User | null> {
    return this.prismaService.user.findFirst({
      where: {
        id: options.id,
        kakaoId: options.kakaoId,
        deletedAt: null,
      },
    });
  }

  create(options: IAuthRepository.CreateUserOptions): Promise<IAuthRepository.User> {
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
