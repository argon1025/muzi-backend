import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class PostFavoriteCampaignRequest {
  @ApiProperty({ description: '캠페인 아이디', example: '12j32h1j2jk' })
  @IsString()
  @IsNotEmpty()
  campaignId: string;
}

@Exclude()
export class PostFavoriteCampaignResponse {
  @Expose()
  success: boolean;
}
