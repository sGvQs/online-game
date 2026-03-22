-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('STAR_SHIELD', 'NULL_HAND', 'ERROR_HUNTER');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SETUP', 'WAITING', 'PLAYING', 'FINISHED');

-- DropForeignKey
ALTER TABLE "star_shield_user_heal" DROP CONSTRAINT "star_shield_user_heal_user_id_fkey";

-- DropIndex
DROP INDEX "error_events_room_id_idx";

-- AlterTable: ErrorEvent - remove redundant roomId
ALTER TABLE "error_events" DROP COLUMN "room_id";

-- AlterTable: StarShieldUserProgress - add healLevel column
ALTER TABLE "star_shield_user_progress" ADD COLUMN "heal_level" INTEGER;

-- Migrate heal data from star_shield_user_heal → star_shield_user_progress.heal_level
UPDATE "star_shield_user_progress" p
SET "heal_level" = h."level"
FROM "star_shield_user_heal" h
WHERE p."user_id" = h."user_id";

-- DropTable: StarShieldUserHeal
DROP TABLE "star_shield_user_heal";

-- AlterTable: Match game_type - migrate string → enum
-- Step 1: Add temporary column for new enum type
ALTER TABLE "matches" ADD COLUMN "game_type_new" "GameType";

-- Step 2: Populate enum column from existing string values
UPDATE "matches" SET "game_type_new" =
  CASE "game_type"
    WHEN 'star-shield'  THEN 'STAR_SHIELD'::"GameType"
    WHEN 'null-hand'    THEN 'NULL_HAND'::"GameType"
    WHEN 'error-hunter' THEN 'ERROR_HUNTER'::"GameType"
  END;

-- Step 3: Drop old column and rename new one
ALTER TABLE "matches" DROP COLUMN "game_type";
ALTER TABLE "matches" RENAME COLUMN "game_type_new" TO "game_type";
ALTER TABLE "matches" ALTER COLUMN "game_type" SET NOT NULL;

-- AlterTable: Match status - migrate string → enum
-- Step 1: Add temporary column
ALTER TABLE "matches" ADD COLUMN "status_new" "MatchStatus";

-- Step 2: Populate
UPDATE "matches" SET "status_new" = "status"::"MatchStatus";

-- Step 3: Drop old column and rename (with default)
ALTER TABLE "matches" DROP COLUMN "status";
ALTER TABLE "matches" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "matches" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "matches" ALTER COLUMN "status" SET DEFAULT 'WAITING'::"MatchStatus";

-- AlterTable: Match - remove NullHand-specific columns (after migrating to NullHandMatch)
-- Step 1: Create null_hand_matches table first
CREATE TABLE "null_hand_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_id" UUID NOT NULL,
    "current_turn_index" INTEGER NOT NULL DEFAULT 1,
    "total_turns" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "null_hand_matches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "null_hand_matches_match_id_key" ON "null_hand_matches"("match_id");

ALTER TABLE "null_hand_matches" ADD CONSTRAINT "null_hand_matches_match_id_fkey"
  FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 2: Migrate existing NullHand match data
INSERT INTO "null_hand_matches" ("match_id", "current_turn_index", "total_turns")
SELECT "id", "current_turn_index", "total_turns"
FROM "matches"
WHERE "game_type" = 'NULL_HAND';

-- Step 3: Drop old columns from matches
ALTER TABLE "matches" DROP COLUMN "current_turn_index";
ALTER TABLE "matches" DROP COLUMN "total_turns";
