-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ADD COLUMN     "userId" TEXT;

-- CreateIndex 조건부 유니크 추가
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId") WHERE "deletedAt" IS NULL AND "userId" IS NOT NULL;

-- CreateIndex 조건부 유니크 추가
CREATE UNIQUE INDEX "User_kakaoId_key" ON "User"("kakaoId") WHERE "deletedAt" IS NULL AND "kakaoId" IS NOT NULL;