export const CAMPAIGN_SERVICE = Symbol('CAMPAIGN_SERVICE');

/**
 * 외부객체와 소통하는 CampaignService 인터페이스
 */
export namespace ICampaignService {
  export interface Base {
    /** 캠페인 검색 */
    findMany(options: FindManyOptions): Promise<FindManyResult>;
    /** 사용자별 캠페인 즐겨찾기 검색 */
    findManyUserCampaign(options: FindManyUserCampaignOptions): Promise<FindManyUserCampaignResult>;
    /** 사용자별 캠페인 즐겨찾기 등록 */
    createUserCampaign(options: CreateUserCampaignOptions): Promise<void>;
    /** 사용자별 캠페인 즐겨찾기 삭제 */
    deleteUserCampaign(options: DeleteUserCampaignOptions): Promise<void>;
  }

  export interface FindManyOptions {
    /** 캠페인 제목 */
    title?: string;
    /** 도시 */
    city?: string;
    size: number;
    page: number;
  }

  export interface FindManyResult {
    list: {
      id: string;
      /** 리소스 제공자 */
      resourceProvider: string;
      /** 리뷰 대상 플랫폼 */
      targetPlatforms: string;
      /** 캠페인 유형 */
      category: string;
      /** 캠페인 제목 */
      title: string;
      /** 썸네일 URL */
      thumbnail?: string;
      /** 도시 */
      city?: string;
      /** 신청 시작일 */
      startedAt?: Date;
      /** 신청 마감일 */
      endedAt?: Date;
      /** 당첨자 발표일 */
      drawAt?: Date;
      deletedAt?: Date;
      updatedAt: Date;
      createdAt: Date;
    }[];
    total: number;
  }

  export interface FindManyUserCampaignOptions {
    userId: string;
    size: number;
    page: number;
  }

  export interface FindManyUserCampaignResult {
    total: number;
    list: {
      /** 즐겨찾기 id */
      id: string;
      /** 캠페인 정보 */
      campaignDetail: {
        /** 캠페인 아이디  */
        id: string;
        /** 리소스 제공자 */
        resourceProvider: string;
        /** 리뷰 대상 플랫폼 */
        targetPlatforms: string;
        /** 캠페인 유형 */
        category: string;
        /** 캠페인 제목 */
        title: string;
        /** 썸네일 URL */
        thumbnail?: string;
        /** 도시 */
        city?: string;
        /** 신청 시작일 */
        startedAt?: Date;
        /** 신청 마감일 */
        endedAt?: Date;
        /** 당첨자 발표일 */
        drawAt?: Date;
        updatedAt: Date;
        createdAt: Date;
      };
    }[];
  }

  export interface CreateUserCampaignOptions {
    userId: string;
    campaignId: string;
  }

  export interface DeleteUserCampaignOptions {
    /** 즐겨찾기 아이디 */
    id: string;
    /** 사용자 아이디 */
    userId: string;
  }
}
