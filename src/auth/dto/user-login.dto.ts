import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsAlphanumeric, Length } from 'class-validator';

export class UserLoginRequest {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(4, 20)
  @ApiProperty({ description: '유저 아이디 (영문 숫자 4글자 이상)', example: 'test' })
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @ApiProperty({ description: '비밀번호 (8자리 이상 20글자 이하)' })
  password: string;
}

export class UserLoginResponse {
  success: boolean;
}
