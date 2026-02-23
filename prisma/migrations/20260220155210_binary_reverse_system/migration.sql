/*
  Warnings:

  - You are about to drop the column `fake_change_rate_value` on the `janken_events` table. All the data in the column will be lost.
  - You are about to drop the column `fake_favorite_hand_value` on the `janken_events` table. All the data in the column will be lost.
  - You are about to drop the column `fake_hand_value` on the `janken_events` table. All the data in the column will be lost.
  - You are about to drop the column `fake_target` on the `janken_events` table. All the data in the column will be lost.
  - You are about to drop the column `initial_hand` on the `janken_events` table. All the data in the column will be lost.
  - You are about to drop the column `final_hand` on the `janken_logs` table. All the data in the column will be lost.
  - You are about to drop the column `initial_hand` on the `janken_logs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "janken_logs_user_id_initial_hand_idx";

-- AlterTable
ALTER TABLE "janken_events" DROP COLUMN "fake_change_rate_value",
DROP COLUMN "fake_favorite_hand_value",
DROP COLUMN "fake_hand_value",
DROP COLUMN "fake_target",
DROP COLUMN "initial_hand",
ADD COLUMN     "host_choice" TEXT,
ADD COLUMN     "system_bluff_hand" TEXT,
ADD COLUMN     "system_real_hand" TEXT,
ALTER COLUMN "phase" SET DEFAULT 'DEAL';

-- AlterTable
ALTER TABLE "janken_logs" DROP COLUMN "final_hand",
DROP COLUMN "initial_hand",
ADD COLUMN     "host_choice" TEXT,
ADD COLUMN     "is_host" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "janken_logs_user_id_is_host_idx" ON "janken_logs"("user_id", "is_host");
