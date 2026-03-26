-- DropForeignKey
ALTER TABLE "guest_hands" DROP CONSTRAINT "guest_hands_user_id_fkey";

-- DropForeignKey
ALTER TABLE "janken_logs" DROP CONSTRAINT "janken_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "match_scores" DROP CONSTRAINT "match_scores_user_id_fkey";

-- CreateIndex
CREATE INDEX "error_events_room_id_idx" ON "error_events"("room_id");

-- CreateIndex
CREATE INDEX "matches_room_id_idx" ON "matches"("room_id");

-- AddForeignKey
ALTER TABLE "guest_hands" ADD CONSTRAINT "guest_hands_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "janken_logs" ADD CONSTRAINT "janken_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_scores" ADD CONSTRAINT "match_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
