import { JwtUtilityException } from './jwt-utility.exception';

describe('JwtUtilityException', () => {
  it('에러 메시지를 가져올 수 있다.', () => {
    // given
    const errorMessage = 'test';
    const errorData = 'test';

    // when
    const result = new JwtUtilityException(errorMessage, errorData);

    // then
    expect(result.getErrorMessage()).toBe(errorMessage);
  });

  it('에러 데이터를 가져올 수 있다.', () => {
    // given
    const errorMessage = 'test';
    const errorData = 'test';

    // when
    const result = new JwtUtilityException(errorMessage, errorData);

    // then
    expect(result.getErrorData()).toBe(errorData);
  });

  it('HttpStatusCode는 500으로 초기화 한다.', () => {
    // given
    const errorMessage = 'test';
    const errorData = 'test';

    // when
    const result = new JwtUtilityException(errorMessage, errorData);

    // then
    expect(result.getStatus()).toBe(500);
  });
});
