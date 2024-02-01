import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteFavoriteCampaignRequest {
  @ApiProperty({ description: '즐겨찾기 아이디', example: '12j32h1j2jk' })
  @IsString()
  @IsNotEmpty()
  favoriteId: string;
}

@Exclude()
export class DeleteFavoriteCampaignResponse {
  @Expose()
  success: boolean;
}
