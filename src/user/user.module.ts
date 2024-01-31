import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { JwtUtilityModule } from '../library/jwt-utility/jwt-utility.module';
import { USER_SERVICE } from './type/user.service.interface';
import { USER_REPOSITORY } from './type/user.repository.interface';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { PrismaModule } from '../library/prisma/prisma.module';

@Module({
  imports: [JwtUtilityModule, PrismaModule],
  controllers: [UserController],
  providers: [
    { provide: USER_SERVICE, useClass: UserService },
    { provide: USER_REPOSITORY, useClass: UserRepository },
  ],
})
export class UserModule {}
