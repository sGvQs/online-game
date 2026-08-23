-- CreateEnum
CREATE TYPE "FaceIcon" AS ENUM ('BOY_FACE', 'LADY_FACE', 'GRANPA_FACE', 'WHITE_FACE', 'BLACK_FACE', 'BROWN_FACE', 'BUG_FACE');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('STAR_SHIELD');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SETUP', 'WAITING', 'PLAYING', 'FINISHED');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('LOBBY', 'PLAYING', 'FINISHED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "comment" TEXT,
    "face_icon" "FaceIcon" NOT NULL DEFAULT 'BOY_FACE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_deleted_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "room_deleted_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID NOT NULL,
    "current_match_id" UUID,
    "active_game_type" TEXT,
    "status" "RoomStatus" NOT NULL DEFAULT 'LOBBY',

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_ready" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_idp" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supabase_uid" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "user_idp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "game_type" "GameType" NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'WAITING',
    "winner_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "typing_shoot_matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "match_id" UUID NOT NULL,
    "shooter_id" UUID NOT NULL,
    "typist_id" UUID NOT NULL,
    "character_name" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'NORMAL',
    "target_asteroid_count" INTEGER NOT NULL DEFAULT 0,
    "spawned_count" INTEGER NOT NULL DEFAULT 0,
    "destroyed_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "is_cleared" BOOLEAN NOT NULL DEFAULT false,
    "failure_reason" TEXT,
    "accuracy_rate" DOUBLE PRECISION,
    "duration_seconds" INTEGER,

    CONSTRAINT "typing_shoot_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "star_shield_clear_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shooter_id" UUID NOT NULL,
    "typist_id" UUID NOT NULL,
    "destroyed_count" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "star_shield_clear_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "star_shield_user_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "total_typing_count" INTEGER NOT NULL DEFAULT 0,
    "selected_normal_attack_id" TEXT,
    "selected_special_attack_id" TEXT,
    "selected_heal_level" INTEGER,
    "star_hp_level" INTEGER NOT NULL DEFAULT 1,
    "heal_level" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "star_shield_user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "star_shield_user_normal_attacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "technique_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "star_shield_user_normal_attacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "star_shield_user_special_attacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "special_attack_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "star_shield_user_special_attacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "star_shield_purchase_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "purchase_type" TEXT NOT NULL,
    "target_skill_id" TEXT,
    "target_level" INTEGER,
    "typing_cost" INTEGER NOT NULL,
    "total_typing_before" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "star_shield_purchase_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "room_users_user_id_idx" ON "room_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_users_room_id_user_id_key" ON "room_users"("room_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_idp_supabase_uid_key" ON "user_idp"("supabase_uid");

-- CreateIndex
CREATE INDEX "user_idp_user_id_idx" ON "user_idp"("user_id");

-- CreateIndex
CREATE INDEX "matches_room_id_idx" ON "matches"("room_id");

-- CreateIndex
CREATE INDEX "monthly_rankings_year_month_total_points_idx" ON "monthly_rankings"("year", "month", "total_points" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_rankings_user_id_year_month_key" ON "monthly_rankings"("user_id", "year", "month");

-- CreateIndex
CREATE INDEX "point_logs_user_id_game_type_idx" ON "point_logs"("user_id", "game_type");

-- CreateIndex
CREATE UNIQUE INDEX "typing_shoot_matches_match_id_key" ON "typing_shoot_matches"("match_id");

-- CreateIndex
CREATE INDEX "typing_shoot_matches_shooter_id_is_cleared_idx" ON "typing_shoot_matches"("shooter_id", "is_cleared");

-- CreateIndex
CREATE INDEX "typing_shoot_matches_typist_id_is_cleared_idx" ON "typing_shoot_matches"("typist_id", "is_cleared");

-- CreateIndex
CREATE INDEX "star_shield_clear_records_shooter_id_typist_id_idx" ON "star_shield_clear_records"("shooter_id", "typist_id");

-- CreateIndex
CREATE INDEX "star_shield_clear_records_typist_id_shooter_id_idx" ON "star_shield_clear_records"("typist_id", "shooter_id");

-- CreateIndex
CREATE UNIQUE INDEX "star_shield_user_progress_user_id_key" ON "star_shield_user_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "star_shield_user_normal_attacks_user_id_technique_id_key" ON "star_shield_user_normal_attacks"("user_id", "technique_id");

-- CreateIndex
CREATE UNIQUE INDEX "star_shield_user_special_attacks_user_id_special_attack_id_key" ON "star_shield_user_special_attacks"("user_id", "special_attack_id");

-- CreateIndex
CREATE INDEX "star_shield_purchase_history_user_id_idx" ON "star_shield_purchase_history"("user_id");

-- AddForeignKey
ALTER TABLE "room_deleted_notifications" ADD CONSTRAINT "room_deleted_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_users" ADD CONSTRAINT "room_users_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_users" ADD CONSTRAINT "room_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_idp" ADD CONSTRAINT "user_idp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_rankings" ADD CONSTRAINT "monthly_rankings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_logs" ADD CONSTRAINT "point_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_shoot_matches" ADD CONSTRAINT "typing_shoot_matches_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_shoot_matches" ADD CONSTRAINT "typing_shoot_matches_shooter_id_fkey" FOREIGN KEY ("shooter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_shoot_matches" ADD CONSTRAINT "typing_shoot_matches_typist_id_fkey" FOREIGN KEY ("typist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_clear_records" ADD CONSTRAINT "star_shield_clear_records_shooter_id_fkey" FOREIGN KEY ("shooter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_clear_records" ADD CONSTRAINT "star_shield_clear_records_typist_id_fkey" FOREIGN KEY ("typist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_user_progress" ADD CONSTRAINT "star_shield_user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_user_normal_attacks" ADD CONSTRAINT "star_shield_user_normal_attacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_user_special_attacks" ADD CONSTRAINT "star_shield_user_special_attacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_purchase_history" ADD CONSTRAINT "star_shield_purchase_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
