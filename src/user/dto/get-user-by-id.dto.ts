import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class GetUserByIdResponse {
  @Expose()
  @ApiProperty({ description: '유저 아이디' })
  id: string;

  @Expose()
  @ApiProperty({ description: '가입 유형' })
  provider: string;

  @Expose()
  @ApiProperty({ description: '별명' })
  nickname: string;

  @Expose()
  @ApiProperty({ description: '이메일', nullable: true })
  email: string | null;

  @Expose()
  @ApiProperty({ description: '프로파일 이미지', nullable: true })
  profile: string | null;

  @Expose()
  @ApiProperty({ description: '계정 생성일' })
  createdAt: Date;
}
