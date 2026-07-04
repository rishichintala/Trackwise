-- CreateTable
CREATE TABLE "AiUsage" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "date"          TEXT NOT NULL,
    "insightsCount" INTEGER NOT NULL DEFAULT 0,
    "chatCount"     INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "AiUsage_userId_date_key" ON "AiUsage"("userId", "date");

-- AddForeignKey
ALTER TABLE "AiUsage"
    ADD CONSTRAINT "AiUsage_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
