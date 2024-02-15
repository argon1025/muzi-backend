import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { KakaoAuthDataSource } from './kakao-auth/kakao-auth.data-source';
import { KAKAO_AUTH_DATA_SOURCE } from './kakao-auth/type/kakao-auth.data-source.interface';
import { NAVER_AUTH_DATA_SOURCE } from './naver-auth/type/naver-auth.data-source.interface';
import { NaverAuthDataSource } from './naver-auth/naver-auth.data-source';

@Module({
  imports: [HttpModule],
  providers: [
    { provide: KAKAO_AUTH_DATA_SOURCE, useClass: KakaoAuthDataSource },
    { provide: NAVER_AUTH_DATA_SOURCE, useClass: NaverAuthDataSource },
  ],
  exports: [KAKAO_AUTH_DATA_SOURCE, NAVER_AUTH_DATA_SOURCE],
})
export class DataSourceModule {}
