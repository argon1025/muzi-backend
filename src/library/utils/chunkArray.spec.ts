import { chunkArray } from './chunkArray';

describe('chunkArray', () => {
  it('빈 배열을 전달할 경우 빈 배열을 리턴한다.', () => {
    // given
    const emptyArray = [];

    // when
    const actual = chunkArray(2, emptyArray);

    // then
    expect(actual).toEqual(emptyArray);
  });

  it('배열의 길이가 chunkSize 보다 작을 경우 하나의 요소를 가진 배열을 반환한다.', () => {
    // given
    const array = [1, 2];

    // when
    const actual = chunkArray(4, array);

    // then
    expect(actual).toEqual([[1, 2]]);
  });

  it('배열을 chunkSize 만큼 나눌 수 있는 경우 나누어진 배열을 반환한다.', () => {
    // given
    const array = [1, 2, 3, 4, 5];

    // when
    const actual = chunkArray(2, array);

    // then
    expect(actual).toEqual([[1, 2], [3, 4], [5]]);
  });
});
