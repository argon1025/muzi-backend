import { HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export interface ErrorObject<T> {
  code: T;
  message: string;
  httpStatus: HttpStatus;
}

const dynamicRecord = <T extends { [key in keyof T]: ErrorObject<key> }>(errorObject: T): T & Record<string, ErrorObject<keyof T>> => errorObject;

export const ERROR_CODE = dynamicRecord({
  /**
   * 공통
   */
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: '토큰이 유효하지 않습니다.',
    httpStatus: HttpStatus.UNAUTHORIZED,
  },
  INVALID_DATA: {
    code: 'INVALID_DATA',
    message: '잘못된 데이터입니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },

  /**
   * Auth
   */
  GET_KAKAO_TOKEN_FAILED: {
    code: 'GET_KAKAO_TOKEN_FAILED',
    message: '카카오에서 사용자 정보를 로드하는데 실패 했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  GET_NAVER_TOKEN_FAILED: {
    code: 'GET_NAVER_TOKEN_FAILED',
    message: '네이버에서 사용자 정보를 로드하는데 실패 했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  /**
   * User
   */
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: '존재하지 않는 유저입니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  USER_ALREADY_EXIST: {
    code: 'USER_ALREADY_EXIST',
    message: '이미 존재하는 유저 입니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },

  /**
   * Campaign
   */
  CAMPAIGN_NOT_FOUND: {
    code: 'CAMPAIGN_NOT_FOUND',
    message: '존재하지 않는 캠페인입니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  CAMPAIGN_ALREADY_EXIST: {
    code: 'CAMPAIGN_ALREADY_EXIST',
    message: '이미 존재하는 캠페인 입니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  USER_CAMPAIGN_NOT_FOUND: {
    code: 'USER_CAMPAIGN_NOT_FOUND',
    message: '존재하지 않는 즐겨찾기입니다.',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  USER_CAMPAIGN_NOT_AUTHORIZED: {
    code: 'USER_CAMPAIGN_NOT_AUTHORIZED',
    message: '권한이 없습니다.',
    httpStatus: HttpStatus.FORBIDDEN,
  },
  CAMPAIGN_TYPE_NOT_ALLOWED: {
    code: 'CAMPAIGN_TYPE_NOT_ALLOWED',
    message: '지원하지 않는 캠페인 타입입니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  CAMPAIGN_UPDATE_REQUEST_FAILED: {
    code: 'CAMPAIGN_UPDATE_REQUEST_FAILED',
    message: '업데이트 요청에 실패했습니다.',
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAMPAIGN_ALREADY_ENDED: {
    code: 'CAMPAIGN_ALREADY_ENDED',
    message: '이미 종료된 캠페인입니다 업데이트 요청에 실패했습니다.',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
});

// 스웨거 Exception Description을 위한 데코레이터
export const GenerateSwaggerDocumentByErrorCode = (errorList: ErrorObject<string>[]) => {
  const unauthorized = errorList
    .filter((error) => error.httpStatus === HttpStatus.UNAUTHORIZED)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');
  const badRequest = errorList
    .filter((error) => error.httpStatus === HttpStatus.BAD_REQUEST)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');
  const notFound = errorList
    .filter((error) => error.httpStatus === HttpStatus.NOT_FOUND)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');
  const forbidden = errorList
    .filter((error) => error.httpStatus === HttpStatus.FORBIDDEN)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');
  const internalServerError = errorList
    .filter((error) => error.httpStatus === HttpStatus.INTERNAL_SERVER_ERROR)
    .map((error) => `${error.code}: ${error.message}`)
    .join('</br>');

  return applyDecorators(
    ApiBadRequestResponse({ description: badRequest }),
    ApiForbiddenResponse({ description: forbidden }),
    ApiNotFoundResponse({ description: notFound }),
    ApiUnauthorizedResponse({ description: unauthorized }),
    ApiInternalServerErrorResponse({ description: internalServerError }),
  );
};
