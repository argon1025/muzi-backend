import { IUserRepository } from '../../src/user/type/user.repository.interface';

export class UserRepositoryMock implements IUserRepository.Base {
  private users: IUserRepository.User[] = [];

  async findOne(options: IUserRepository.FindOneOptions): Promise<IUserRepository.User> {
    return (
      this.users.find((user) => {
        if (user.deletedAt !== null) {
          return false;
        }
        if (options.id) {
          return user.id === options.id;
        }
        if (options.kakaoId) {
          return user.kakaoId === options.kakaoId;
        }
        return false;
      }) || null
    );
  }

  async create(options: IUserRepository.CreateUserOptions): Promise<IUserRepository.User> {
    const user: IUserRepository.User = {
      id: Math.random().toString(36).substring(2, 12),
      provider: options.provider,
      nickname: options.nickname,
      kakaoId: options.kakaoId,
      email: options.email,
      profile: options.profile,
      deletedAt: null,
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
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
