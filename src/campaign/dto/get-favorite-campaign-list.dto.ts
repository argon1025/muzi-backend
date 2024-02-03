import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class GetFavoriteCampaignListRequest {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiProperty({ description: '페이지', default: '1', type: 'number' })
  @Transform(({ value }) => Number(value))
  page = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @ApiProperty({ description: '페이지당 아이템 수', default: '10', type: 'number' })
  @Transform(({ value }) => Number(value))
  size = 10;
}
@Exclude()
class GetFavoriteCampaignDetail {
  @Expose()
  @ApiProperty({ description: '캠페인 id' })
  id: string;

  @Expose()
  @ApiProperty({ description: '리소스 제공자', example: '체험단모집' })
  resourceProvider: string;

  @Expose()
  @ApiProperty({ description: '원본 링크', example: 'https://example.com' })
  originUrl: string;

  @Expose()
  @ApiProperty({ description: '캠페인 제목', example: '맛있는 음식 체험단' })
  title: string;

  @Expose()
  @ApiProperty({ description: '캠페인 유형', example: '방문, 배송, 기자단, 기타' })
  category?: string;

  @Expose()
  @ApiProperty({ description: '리뷰 대상 플랫폼', example: '블로그, 인스타' })
  targetPlatforms?: string;

  @Expose()
  @ApiProperty({ description: '썸네일 URL', example: 'https://example.com/thumbnail.jpg' })
  thumbnail?: string;

  @Expose()
  @ApiProperty({ description: '상세 주소', example: '대구시 북구 국우동' })
  address?: string;

  @Expose()
  @ApiProperty({ description: '캠페인 모집 인원', example: 1 })
  recruitCount?: number;

  @Expose()
  @ApiProperty({ description: '캠페인 신청 인원', example: 1 })
  applyCount?: number;

  @Expose()
  @ApiProperty({ description: '신청 시작일 ISO8601', example: '2023-01-01T01:01:01.000Z' })
  startedAt?: Date;

  @Expose()
  @ApiProperty({ description: '신청 마감일 ISO8601', example: '2023-01-01T01:01:01.000Z' })
  endedAt?: Date;

  @Expose()
  @ApiProperty({ description: '당첨자 발표일 ISO8601', example: '2023-01-01T01:01:01.000Z' })
  drawAt?: Date;

  @Expose()
  @ApiProperty({ description: '업데이트일 ISO8601', example: '2023-01-01T01:01:01.000Z' })
  updatedAt: Date;

  @Expose()
  @ApiProperty({ description: '등록일 ISO8601', example: '2023-01-01T01:01:01.000Z' })
  createdAt: Date;
}

@Exclude()
class GetFavoriteCampaignItem {
  @Expose()
  @ApiProperty({ description: '즐겨찾기 id' })
  id: string;

  @Expose()
  @ApiProperty({ description: '캠페인 상세 정보' })
  @Type(() => GetFavoriteCampaignDetail)
  campaignDetail: GetFavoriteCampaignDetail;
}

@Exclude()
export class GetFavoriteCampaignListResponse {
  @Expose()
  @ApiProperty({ description: '즐겨찾기 캠페인 목록', type: [GetFavoriteCampaignItem] })
  @Type(() => GetFavoriteCampaignItem)
  list: GetFavoriteCampaignItem[];

  @Expose()
  @ApiProperty({ description: '총 아이템 수', type: 'number' })
  total: number;
}
