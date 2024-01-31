import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class KakaoLoginRequest {
  @ApiProperty({
    example: 'X3AB2QWpl_lWs5KqZ1iWc4R1tASkJ_',
    description: '카카오 로그인 시 발급되는 카카오 고유 아이디',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
