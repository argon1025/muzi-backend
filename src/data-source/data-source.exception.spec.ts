import { DataSourceException } from './data-source.exception';

describe('DataSourceException', () => {
  it('올바르게 초기화되고 속성을 정확히 반환하는지 검증', () => {
    // given
    const errorMessage = 'Test error message';
    const statusCode = 500;
    const requestConfig = { method: 'GET', url: '/api/data' };

    // when
    const exception = new DataSourceException(errorMessage, statusCode, requestConfig);

    // then
    expect(exception.getErrorMessage()).toBe(errorMessage);
    expect(exception.getStatusCode()).toBe(statusCode);
    expect(exception.getRequestConfig()).toBe(requestConfig);
  });
});
