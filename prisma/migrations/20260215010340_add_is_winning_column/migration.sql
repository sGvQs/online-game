/*
  Warnings:

  - You are about to drop the column `phase_ends_at` on the `janken_events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "janken_logs" DROP CONSTRAINT "janken_logs_match_id_fkey";

-- AlterTable
ALTER TABLE "janken_events" DROP COLUMN "phase_ends_at";

-- AlterTable
ALTER TABLE "janken_logs" ADD COLUMN     "is_winning" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "match_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "janken_logs" ADD CONSTRAINT "janken_logs_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
