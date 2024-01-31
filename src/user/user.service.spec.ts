import { NotFoundException } from '@nestjs/common';
import { UserRepositoryMock } from '../../test/utils/user.repository.mock';
import { UserService } from './user.service';
import { ERROR_CODE } from '../library/exception/error.constant';

describe('UserService', () => {
  const userRepository = new UserRepositoryMock();
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(userRepository);
  });

  afterEach(() => {
    userRepository.clear();
    jest.restoreAllMocks();
  });

  describe('getUserById', () => {
    it('유저를 찾았을 경우 유저를 반환한다.', async () => {
      // given
      const dataBaseData = [
        {
          id: 'j2h31jhk1',
          provider: 'kakao',
          kakaoId: '123123123',
          nickname: 'test',
          email: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      userRepository.init(dataBaseData);

      // when
      const result = await userService.getUserById('j2h31jhk1');

      // then
      expect(result).toEqual(dataBaseData[0]);
    });

    it('유저를 찾지 못했을 경우 NotFoundException을 반환한다.', async () => {
      // given & when
      const result = userService.getUserById('j2h31jhk1');

      // then
      const expectedError = new NotFoundException(ERROR_CODE.USER_NOT_FOUND);
      expect(result).rejects.toThrow(expectedError);
    });
  });
});
