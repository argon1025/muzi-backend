import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { JwtUtilityModule } from '../library/jwt-utility/jwt-utility.module';
import { USER_SERVICE } from './type/user.service.interface';

import { UserService } from './user.service';
import { PrismaModule } from '../library/prisma/prisma.module';

@Module({
  imports: [JwtUtilityModule, PrismaModule],
  controllers: [UserController],
  providers: [{ provide: USER_SERVICE, useClass: UserService }],
})
export class UserModule {}
