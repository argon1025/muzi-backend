-- CreateTable
CREATE TABLE "ParsingEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventStatus" TEXT NOT NULL,
    "eventMessage" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParsingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParsingEventLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParsingEventLog_pkey" PRIMARY KEY ("id")
);
