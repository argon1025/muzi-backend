export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export namespace IUserRepository {
  export interface Base {
    getUserById(userId: string): Promise<GetUserByIdResult>;
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

  export type GetUserByIdResult = User;
}
