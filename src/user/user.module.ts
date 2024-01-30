import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './type/user.repository.interface';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { USER_SERVICE } from './type/user.service.interface';
import { JwtUtilityModule } from '../library/jwt-utility/jwt-utility.module';
import { DataSourceModule } from '../data-source/data-source.module';
import { PrismaModule } from '../library/prisma/prisma.module';
import { UserController } from './user.controller';

@Module({
  imports: [JwtUtilityModule, DataSourceModule, PrismaModule],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: USER_SERVICE, useClass: UserService },
  ],
  exports: [],
})
export class UserModule {}
