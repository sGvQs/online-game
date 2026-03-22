-- AlterTable
ALTER TABLE "star_shield_user_special_attacks" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "star_shield_user_special_attacks" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
