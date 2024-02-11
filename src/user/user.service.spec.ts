import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { ERROR_CODE } from '../library/exception/error.constant';
import { PrismaService } from '../library/prisma/prisma.service';

describe('UserService', () => {
  const prismaService = new PrismaService();
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(prismaService);
  });

  afterEach(async () => {
    await prismaService.$transaction([prismaService.user.deleteMany()]);
    jest.restoreAllMocks();
  });

  describe('getUserById', () => {
    it('유저를 찾았을 경우 유저를 반환한다.', async () => {
      // given
      const dataBaseData = [
        {
          id: 'user1',
          provider: 'kakao',
          kakaoId: '123123123',
          nickname: 'test',
          email: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      await prismaService.user.createMany({ data: dataBaseData });

      // when
      const result = await userService.getUserById('user1');

      // then
      expect(result.id).toEqual('user1');
    });

    it('유저를 찾지 못했을 경우 NotFoundException을 반환한다.', async () => {
      // given & when
      const result = userService.getUserById('j2h31jhk1');

      // then
      const expectedError = new NotFoundException(ERROR_CODE.USER_NOT_FOUND);
      expect(result).rejects.toThrow(expectedError);
    });
  });

  describe('deleteUserById', () => {
    it('유저를 정상적으로 삭제한 경우.', async () => {
      // given
      const dataBaseData = [
        {
          id: 'user1',
          provider: 'kakao',
          kakaoId: '123123123',
          nickname: 'test',
          email: null,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      await prismaService.user.createMany({ data: dataBaseData });

      // when
      await userService.deleteUserById({ userId: 'user1' });

      // then
      const user = await prismaService.user.findFirst({ where: { id: 'user1', deletedAt: null } });
      expect(user).toBeNull();
    });

    it('이미 삭제된 유저를 삭제하려고 시도한 경우 NotFoundException을 반환한다.', async () => {
      // given
      const dataBaseData = [
        {
          id: 'user1',
          provider: 'kakao',
          kakaoId: '123123123',
          nickname: 'test',
          email: null,
          deletedAt: new Date(),
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      await prismaService.user.createMany({ data: dataBaseData });

      // when
      const result = userService.deleteUserById({ userId: 'user1' });

      // then
      await expect(result).rejects.toThrow(new NotFoundException(ERROR_CODE.USER_NOT_FOUND));
    });
    it('유저를 찾지 못했을 경우 NotFoundException을 반환한다.', async () => {
      // given & when
      const result = userService.deleteUserById({ userId: 'user1' });

      // then
      await expect(result).rejects.toThrow(new NotFoundException(ERROR_CODE.USER_NOT_FOUND));
    });
  });
});
