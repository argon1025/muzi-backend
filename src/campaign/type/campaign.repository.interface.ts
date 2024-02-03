export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');
/**
 * 외부객체와 소통하는 CampaignRepository 인터페이스
 */
export namespace ICampaignRepository {
  export interface Base {
    /** 캠페인 검색 */
    findMany(options: FindManyOptions): Promise<FindManyResult>;
    /** 캠페인 상세 */
    findOne(id: string): Promise<FindOneResult>;
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

  /**
   * 등록된 캠페인 검색 옵션
   */
  export interface FindManyOptions {
    /** 캠페인 제목 */
    title?: string;
    /** 도시 */
    address?: string;
    size: number;
    page: number;
  }

  /**
   * 등록된 캠페인 검색 결과
   */
  export interface FindManyResult {
    list: Campaign[];
    total: number;
  }

  export type FindOneResult = Campaign;
}
