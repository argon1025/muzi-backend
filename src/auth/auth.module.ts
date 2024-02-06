import { Module } from '@nestjs/common';
import { DataSourceModule } from '../data-source/data-source.module';
import { JwtUtilityModule } from '../library/jwt-utility/jwt-utility.module';
import { PrismaModule } from '../library/prisma/prisma.module';
import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './type/auth.service.interface';

@Module({
  imports: [JwtUtilityModule, DataSourceModule, PrismaModule],
  controllers: [AuthController],
  providers: [{ provide: AUTH_SERVICE, useClass: AuthService }],
  exports: [],
})
export class AuthModule {}
