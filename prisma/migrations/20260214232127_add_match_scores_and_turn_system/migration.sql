-- AlterTable
ALTER TABLE "janken_events" ADD COLUMN     "fake_change_rate_value" INTEGER,
ADD COLUMN     "fake_favorite_hand_value" TEXT,
ADD COLUMN     "fake_hand_value" TEXT;

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "current_turn_index" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "total_turns" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "match_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_scores_match_id_user_id_key" ON "match_scores"("match_id", "user_id");

-- AddForeignKey
ALTER TABLE "match_scores" ADD CONSTRAINT "match_scores_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_scores" ADD CONSTRAINT "match_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
