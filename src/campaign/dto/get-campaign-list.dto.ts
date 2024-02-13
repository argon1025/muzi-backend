import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ICampaignService } from '../type/campaign.service.interface';

export class GetCampaignListRequest {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ description: '타이틀 검색', example: '맛있는 음식' })
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ description: '도시 검색', example: '서울' })
  address?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ description: '카테고리 검색', example: '방문, 배송, 기자단, 기타' })
  category?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '응모 가능한 캠페인만 조회', type: 'boolean' })
  @Transform(({ value }) => value === 'true')
  hasAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiProperty({ description: '페이지', default: '1', type: 'number' })
  @Transform(({ value }) => Number(value))
  page = 1;

  @IsEnum(ICampaignService.FindManyOrderByOption)
  @IsOptional()
  @ApiProperty({
    description: '정렬 방식',
    enum: ICampaignService.FindManyOrderByOption,
    default: ICampaignService.FindManyOrderByOption.ENDED_AT_ASC,
  })
  orderBy = ICampaignService.FindManyOrderByOption.ENDED_AT_ASC;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @ApiProperty({ description: '페이지당 아이템 수', default: '10', type: 'number' })
  @Transform(({ value }) => Number(value))
  size = 10;
}

@Exclude()
class GetCampaignListItem {
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
export class GetCampaignListResponse {
  @Expose()
  @ApiProperty({ description: '등록된 캠페인 리스트' })
  @Type(() => GetCampaignListItem)
  list: GetCampaignListItem[];

  @Expose()
  @ApiProperty({ description: '등록된 캠페인 수' })
  total: number;
}
