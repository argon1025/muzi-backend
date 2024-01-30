import { HttpException } from '@nestjs/common';

export class DataSourceException extends HttpException {
  constructor(
    private errorMessage: string,
    private statusCode: number,
    private requestConfig: any,
  ) {
    super(errorMessage, statusCode);
  }

  getErrorMessage() {
    return this.errorMessage;
  }

  getStatusCode() {
    return this.statusCode;
  }

  getRequestConfig() {
    return this.requestConfig;
  }
}
