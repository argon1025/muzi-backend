export const SEOULOUBA_PARSER = Symbol('SEOULOUBA_PARSER');

export namespace ISeouloubaParser {
  export interface Base {
    /**
     * 캠페인 정보를 가져와서 저장한다
     */
    runWorker(options: RunWorkerOptions): Promise<RunWorkerResult>;

    /**
     * 현재 진행중인 모든 캠페인 게시글 id 리스트를 가져온다
     */
    getAllIdList(url: string): Promise<GetAllIdListResult>;

    /**
     * 캠페인의 상세 정보를 가져온다
     */
    getDetailById(id: string): Promise<GetDetailByIdResult>;
  }

  export interface RunWorkerOptions {
    /** 특정 게시글만 상세정보를 업데이트 할 경우 */
    postIdList?: string[];
    /** 이벤트 아이디 */
    eventId: string;
  }

  export interface RunWorkerResult {
    /** 전체 작업 수 */
    total: number;
    /** 성공한 작업 수 */
    successCount: number;
    /** 실패한 작업 수 */
    failedCount: number;
  }

  export type GetAllIdListResult = string[];

  export interface GetDetailByIdResult {
    /** 서울오빠 게시글 아이디 */
    id: string;
    title: string;
    thumbnail: string;
    /** 캠페인 방문 주소 */
    address: string;
    /** 캠페인 유형 (방문, 배송, 기자단, 기타) */
    category: string;
    /** 캠페인 모집 인원 */
    recruitCount: number;
    /** 캠페인 신청 인원 */
    applyCount: number;
    /** 캠페인 주소 */
    originUrl: string;
    /** 캠페인 신청 시작일 */
    startedAt: Date;
    /** 캠페인 신청 종료일 */
    endedAt: Date;
    /** 당첨자 발표일 */
    drawAt: Date;
  }
}
