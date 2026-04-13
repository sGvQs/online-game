/*
  Warnings:

  - You are about to drop the `home_orbit_destroy_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "GameType" ADD VALUE 'METEOR_BUSTERS';

-- DropForeignKey
ALTER TABLE "home_orbit_destroy_records" DROP CONSTRAINT "home_orbit_destroy_records_user_id_fkey";

-- DropTable
DROP TABLE "home_orbit_destroy_records";

-- CreateTable
CREATE TABLE "meteor_busters_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_id" UUID NOT NULL,
    "difficulty" TEXT NOT NULL,
    "total_spawn_count" INTEGER NOT NULL,
    "spawned_count" INTEGER NOT NULL DEFAULT 0,
    "destroyed_count" INTEGER NOT NULL DEFAULT 0,
    "destroy_rate" DOUBLE PRECISION,
    "is_cleared" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "meteor_busters_matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meteor_busters_matches_match_id_key" ON "meteor_busters_matches"("match_id");

-- AddForeignKey
ALTER TABLE "meteor_busters_matches" ADD CONSTRAINT "meteor_busters_matches_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
