import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class PostJoinWithUserIdRequest {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(4, 20)
  @ApiProperty({ description: '유저 아이디 (영문 숫자 4글자 이상)', example: 'test' })
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @ApiProperty({ description: '비밀번호 (8자리 이상 20글자 이하)', example: 'test1234' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[ㄱ-ㅎ가-힣a-zA-Z0-9]*$/)
  @Length(2, 10)
  @ApiProperty({ description: '닉네임 (영문 숫자 한글 2글자 이상 10글자 이하)', example: '테스트' })
  nickname: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: '이메일', example: 'test@gmail.com' })
  email?: string;

  @IsString()
  @ApiProperty({ description: '프로필 이미지', example: 'https://test.com/test.png' })
  profile?: string;
}

export class PostJoinWithUserIdResponse {
  success: boolean;
}
