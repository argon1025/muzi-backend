import { HttpException } from '@nestjs/common';

export class JwtUtilityException extends HttpException {
  constructor(
    private errorMessage: string,
    private errorData: any,
  ) {
    super(errorMessage, 500);
  }

  getErrorMessage() {
    return this.errorMessage;
  }

  getErrorData() {
    return this.errorData;
  }
}
