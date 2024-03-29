import { Body, Controller, Delete, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CAMPAIGN_SERVICE, ICampaignService } from './type/campaign.service.interface';
import { AccessTokenGuard } from '../library/jwt-utility/guard/access-token.guard';
import { GetCampaignListRequest, GetCampaignListResponse } from './dto/get-campaign-list.dto';
import { GetFavoriteCampaignListRequest, GetFavoriteCampaignListResponse } from './dto/get-favorite-campaign-list.dto';
import { UserInfo } from '../library/jwt-utility/decorator/user-info.decorator';
import { IJwtUtilityService } from '../library/jwt-utility/type/jwt-utility.service.interface';
import { PostFavoriteCampaignRequest } from './dto/post-favorite-campaign.dto';
import { DeleteFavoriteCampaignRequest } from './dto/delete-favorite-campaign.dto';
import { ERROR_CODE, GenerateSwaggerDocumentByErrorCode } from '../library/exception/error.constant';
import { AuthOptional } from '../library/jwt-utility/decorator/auth-optional.decorator';

@Controller('campaign')
@ApiTags('- 캠페인')
@UseGuards(AccessTokenGuard)
export class CampaignController {
  constructor(
    @Inject(CAMPAIGN_SERVICE)
    private readonly campaignService: ICampaignService.Base,
  ) {}

  @Get()
  @ApiOperation({ summary: '캠페인 목록 조회' })
  @AuthOptional()
  async getCampaignList(@Query() options: GetCampaignListRequest) {
    return plainToInstance(GetCampaignListResponse, await this.campaignService.findMany(options));
  }

  @Post('update-async/:id')
  @ApiOperation({ summary: '캠페인 업데이트 요청', description: '캠페인 업데이트 요청을 생성합니다. 해당 요청은 비동기로 처리됩니다.' })
  @ApiCookieAuth()
  @GenerateSwaggerDocumentByErrorCode([
    ERROR_CODE.CAMPAIGN_NOT_FOUND,
    ERROR_CODE.CAMPAIGN_TYPE_NOT_ALLOWED,
    ERROR_CODE.CAMPAIGN_ALREADY_ENDED,
    ERROR_CODE.CAMPAIGN_UPDATE_REQUEST_FAILED,
  ])
  async updateCampaign(@Query('id') id: string) {
    await this.campaignService.createUpdateRequestEvent({ id });
  }

  @Get('favorite')
  @ApiOperation({ summary: '회원별 캠페인 즐겨찾기 목록 조회' })
  @ApiCookieAuth()
  async getFavoriteCampaignList(@Query() options: GetFavoriteCampaignListRequest, @UserInfo() { userId }: IJwtUtilityService.TokenPayload) {
    return plainToInstance(GetFavoriteCampaignListResponse, await this.campaignService.findManyUserCampaign({ ...options, userId }));
  }

  @Post('favorite')
  @ApiOperation({ summary: '회원별 캠페인 즐겨찾기 목록 등록' })
  @ApiCookieAuth()
  @GenerateSwaggerDocumentByErrorCode([ERROR_CODE.CAMPAIGN_NOT_FOUND, ERROR_CODE.CAMPAIGN_ALREADY_EXIST])
  async addFavoriteCampaign(@Body() options: PostFavoriteCampaignRequest, @UserInfo() { userId }: IJwtUtilityService.TokenPayload) {
    await this.campaignService.createUserCampaign({ ...options, userId });
    return plainToInstance(PostFavoriteCampaignRequest, { success: true });
  }

  @Delete('favorite')
  @ApiOperation({ summary: '회원별 캠페인 즐겨찾기 목록 삭제' })
  @ApiCookieAuth()
  @GenerateSwaggerDocumentByErrorCode([ERROR_CODE.USER_CAMPAIGN_NOT_FOUND, ERROR_CODE.USER_CAMPAIGN_NOT_AUTHORIZED])
  async deleteFavoriteCampaign(@Body() { favoriteId: id }: DeleteFavoriteCampaignRequest, @UserInfo() { userId }: IJwtUtilityService.TokenPayload) {
    await this.campaignService.deleteUserCampaign({ id, userId });
    return plainToInstance(DeleteFavoriteCampaignRequest, { success: true });
  }
}
