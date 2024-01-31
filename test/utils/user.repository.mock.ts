import { IUserRepository } from '../../src/user/type/user.repository.interface';

export class UserRepositoryMock implements IUserRepository.Base {
  private users: IUserRepository.User[] = [];

  async getUserById(userId: string): Promise<IUserRepository.User> {
    return (
      this.users.find((user) => {
        if (user.deletedAt !== null) {
          return false;
        }
        return user.id === userId;
      }) || null
    );
  }

  /**
   * 데이터를 일괄 삭제한다.
   */
  clear(): void {
    this.users = [];
  }

  /**
   * 테스트용 데이터를 초기화한다.
   */
  init(initData?: IUserRepository.User[]): void {
    this.users = initData;
  }

  /**
   * 테스트용 데이터를 모두 가져온다.
   */
  getAllForTest(): IUserRepository.User[] {
    return this.users;
  }
}
