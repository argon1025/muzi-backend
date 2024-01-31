import { IAuthRepository } from '../../src/auth/type/auth.repository.interface';

export class AuthRepositoryMock implements IAuthRepository.Base {
  private users: IAuthRepository.User[] = [];

  async findOne(options: IAuthRepository.FindOneOptions): Promise<IAuthRepository.User> {
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

  async create(options: IAuthRepository.CreateUserOptions): Promise<IAuthRepository.User> {
    const user: IAuthRepository.User = {
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
  init(initData?: IAuthRepository.User[]): void {
    this.users = initData;
  }

  /**
   * 테스트용 데이터를 모두 가져온다.
   */
  getAllForTest(): IAuthRepository.User[] {
    return this.users;
  }
}
