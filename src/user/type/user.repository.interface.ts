export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
/**
 * 외부객체와 소통하는 UserRepository 인터페이스
 */
export namespace IUserRepository {
  /**
   * 추상화된 UserRepository 인터페이스
   */
  export interface Base {
    findOne(options: FindOneOptions): Promise<User>;
    create(options: CreateUserOptions): Promise<User>;
  }

  export interface User {
    id: string;
    /** 가입 유형 */
    provider: string;
    /** 별명 */
    nickname: string;
    /** 카카오 고유 키 */
    kakaoId?: string | null;
    /** 이메일 */
    email?: string | null;
    /** 프로파일 이미지 */
    profile?: string | null;
    /** 삭제일 */
    deletedAt?: Date | null;
    updatedAt: Date;
    createdAt: Date;
  }

  export interface FindOneOptions {
    id?: string;
    kakaoId?: string;
  }

  export interface CreateUserOptions {
    provider: 'kakao' | 'email';
    nickname: string;
    kakaoId?: string;
    email?: string;
    profile?: string;
  }
}
