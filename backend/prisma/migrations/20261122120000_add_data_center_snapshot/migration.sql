-- CreateTable
CREATE TABLE "data_center_snapshots" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "count" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "refreshing" BOOLEAN NOT NULL DEFAULT false,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_center_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_center_snapshots_category_key" ON "data_center_snapshots"("category");
