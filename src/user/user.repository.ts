import { Injectable } from '@nestjs/common';
import { IUserRepository } from './type/user.repository.interface';
import { PrismaService } from '../library/prisma/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository.Base {
  constructor(private readonly prismaService: PrismaService) {}

  getUserById(userId: string): Promise<IUserRepository.GetUserByIdResult> {
    return this.prismaService.user.findFirst({ where: { id: userId, deletedAt: null } });
  }
}
