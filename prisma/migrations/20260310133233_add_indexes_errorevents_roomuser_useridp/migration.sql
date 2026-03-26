-- AlterTable
ALTER TABLE "star_shield_user_special_attacks" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "error_events_match_id_idx" ON "error_events"("match_id");

-- CreateIndex
CREATE INDEX "error_events_match_id_closed_at_idx" ON "error_events"("match_id", "closed_at");

-- CreateIndex
CREATE INDEX "room_users_user_id_idx" ON "room_users"("user_id");

-- CreateIndex
CREATE INDEX "user_idp_user_id_idx" ON "user_idp"("user_id");
