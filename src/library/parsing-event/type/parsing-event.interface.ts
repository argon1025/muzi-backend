export const PARSING_EVENT_SERVICE = Symbol('PARSING_EVENT_SERVICE');
/**
 * 외부 객체와 소통을 위한 EventService 인터페이스
 */
export namespace IParsingEventService {
  export interface Base {
    /** 이벤트 생성 */
    createEvent(options: CreateEventOptions): Promise<void>;
    /** 이벤트 조회 및 점유처리 */
    getEvent(options: GetEventOptions): Promise<GetEventResult>;
    /** 이벤트 작업 상태 수정 */
    modifyEventStatus(options: ModifyEventStatusOptions): Promise<void>;
    /** 이벤트 처리 로그 생성 */
    createLog(options: CreateLogOptions): Promise<void>;
    /** string을 이벤트 타입으로 변환 */
    getEventTypeFromText(eventType: string): EventType;
  }

  export interface CreateEventOptions {
    /** 이벤트 타입 */
    eventType: EventType;
    /** 이벤트 메시지 */
    eventMessage: EventPayload;
  }

  export interface GetEventOptions {
    /** 이벤트 타입 */
    eventType?: EventType;
  }

  export interface GetEventResult {
    /** 이벤트 아이디 */
    id: string;
    /** 이벤트 타입 */
    eventType: EventType;
    /** 이벤트 메시지 */
    eventMessage: EventPayload;
    /** 이벤트 생성일 */
    createdAt: Date;
  }

  export interface ModifyEventStatusOptions {
    /** 이벤트 아이디 */
    eventId: string;
    /** 이벤트 상태 */
    eventStatus: EventStatus;
  }

  export interface CreateLogOptions {
    /** 이벤트 아이디 */
    eventId: string;
    /** 로그 메시지 */
    logMessage: string;
  }

  export enum EventStatus {
    /** 대기 */
    WAIT = 'WAIT',
    /** 처리중 */
    PROCESSING = 'PROCESSING',
    /** 완료 */
    DONE = 'DONE',
    /** 실패 */
    FAIL = 'FAIL',
  }

  export enum EventType {
    /** 디너의 여왕 */
    DINNER_QUEEN = 'DINNER_QUEEN',
    /** 서울오빠 */
    SEOUL_OUBA = 'SEOUL_OUBA',
  }

  export interface EventPayload {
    /** 요청 타입 (전체 스캔, 특정 게시글 업데이트) */
    requestType: 'ALL' | 'UPDATE';
    /** 요청 타입이 업데이트인 경우에만 필수 */
    targetId?: string;
  }
}
