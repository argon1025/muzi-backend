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
    /** 특정 캠페인 업데이트 요청 이벤트 생성 */
    createUpdateRequestEvent(options: CreateUpdateRequestEventOptions): Promise<void>;
  }

  export interface Campaign {
    id: string;
    /** 중복 등록 방지 키 */
    duplicateId: string;
    /** 리소스 제공자 */
    resourceProvider: string;
    /** 원본 링크 */
    originUrl: string;
    /** 캠페인 제목 */
    title: string;
    /** 캠페인 유형 (방문, 배송, 기자단, 기타) */
    category?: string;
    /** 리뷰 대상 플랫폼 (블로그, 인스타) */
    targetPlatforms?: string;
    /** 썸네일 URL */
    thumbnail?: string;
    /** 주소 상세 */
    address?: string;
    /** 캠페인 모집 인원 */
    recruitCount?: number;
    /** 캠페인 신청 인원 */
    applyCount?: number;
    /** 신청 시작일 */
    startedAt?: Date;
    /** 신청 마감일 */
    endedAt?: Date;
    /** 당첨자 발표일 */
    drawAt?: Date;
    deletedAt?: Date;
    updatedAt: Date;
    createdAt: Date;
  }

  export interface FindManyOptions {
    /** 캠페인 제목 */
    title?: string;
    /** 주소 */
    address?: string;
    /** 카테고리 */
    category?: string;
    /** 응모 가능한 캠페인만 검색 */
    hasAvailable?: boolean;
    size: number;
    page: number;
  }

  export interface FindManyResult {
    list: Campaign[];
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
      campaignDetail: Campaign;
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

  export interface CreateUpdateRequestEventOptions {
    /** 캠페인 아이디 */
    id: string;
  }
}
