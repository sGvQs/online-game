-- CreateTable
CREATE TABLE "monthly_rankings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "game_type" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monthly_rankings_year_month_total_points_idx" ON "monthly_rankings"("year", "month", "total_points" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_rankings_user_id_year_month_key" ON "monthly_rankings"("user_id", "year", "month");

-- CreateIndex
CREATE INDEX "point_logs_user_id_game_type_idx" ON "point_logs"("user_id", "game_type");

-- AddForeignKey
ALTER TABLE "monthly_rankings" ADD CONSTRAINT "monthly_rankings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_logs" ADD CONSTRAINT "point_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
