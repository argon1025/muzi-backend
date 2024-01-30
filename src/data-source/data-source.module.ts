import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { KakaoAuthDataSource } from './kakao-auth/kakao-auth.data-source';
import { KAKAO_AUTH_DATA_SOURCE } from './kakao-auth/type/kakao-auth.data-source.interface';

@Module({
  imports: [HttpModule],
  providers: [{ provide: KAKAO_AUTH_DATA_SOURCE, useClass: KakaoAuthDataSource }],
  exports: [KAKAO_AUTH_DATA_SOURCE],
})
export class DataSourceModule {}
