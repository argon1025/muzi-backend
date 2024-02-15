import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class NaverLoginRequest {
  @ApiProperty({
    example: 'X3AB2QWpl_lWs5KqZ1iWc4R1tASkJ_',
    description: '네이버 로그인 인증에 성공하면 반환받는 인증 코드',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'X3AB2QWpl_lWs5KqZ1iWc4R1tASkJ_',
    description: '네이버 토큰으로 URL 인코딩을 적용한 값',
  })
  @IsString()
  @IsNotEmpty()
  state: string;
}
