import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JWT_UTILITY_SERVICE } from './type/jwt-utility.service.interface';
import { JwtUtilityService } from './jwt-utility.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [{ provide: JWT_UTILITY_SERVICE, useClass: JwtUtilityService }],
  exports: [JWT_UTILITY_SERVICE],
})
export class JwtUtilityModule {}
