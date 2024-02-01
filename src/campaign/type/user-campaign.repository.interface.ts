export const USER_CAMPAIGN_REPOSITORY = Symbol('USER_CAMPAIGN_REPOSITORY');
/**
 * 외부객체와 소통하는 UserCampaignRepository 인터페이스
 */
export namespace IUserCampaignRepository {
  export interface Base {
    /** 사용자 캠페인 즐겨찾기 검색 */
    findOneById(options: FindOneByIdOptions): Promise<FindOneByIdResult>;
    findOneByUserIdAndCampaignId(options: FindOneByUserIdAndCampaignIdOptions): Promise<FindOneByUserIdAndCampaignIdResult>;
    /** 사용자별 캠페인 즐겨찾기 검색 */
    findMany(options: FindManyOptions): Promise<FindManyResult>;
    /** 사용자 캠페인 즐겨찾기 등록 */
    create(options: CreateOptions): Promise<void>;
    /** 사용자 캠페인 즐겨찾기 삭제 */
    delete(options: DeleteOptions): Promise<void>;
  }

  export interface FindOneByIdOptions {
    id: string;
  }

  export interface FindOneByIdResult {
    /** 즐겨찾기 id */
    id: string;
    /** 유저 id */
    userId: string;
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
  }

  export interface FindOneByUserIdAndCampaignIdOptions {
    userId: string;
    campaignId: string;
  }

  export interface FindOneByUserIdAndCampaignIdResult {
    /** 즐겨찾기 id */
    id: string;
    /** 유저 id */
    userId: string;
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
  }

  export interface FindManyOptions {
    userId: string;
    campaignId?: string;
    size: number;
    page: number;
  }

  export interface FindManyResult {
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

  export interface CreateOptions {
    userId: string;
    campaignId: string;
  }

  export interface DeleteOptions {
    /** 즐겨찾기 아이디 */
    id: string;
  }
}
