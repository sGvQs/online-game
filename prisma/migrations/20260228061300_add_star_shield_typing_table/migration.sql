-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "updated_at" DROP DEFAULT;

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

-- CreateIndex
CREATE UNIQUE INDEX "typing_shoot_matches_match_id_key" ON "typing_shoot_matches"("match_id");

-- CreateIndex
CREATE INDEX "typing_shoot_matches_shooter_id_is_cleared_idx" ON "typing_shoot_matches"("shooter_id", "is_cleared");

-- CreateIndex
CREATE INDEX "typing_shoot_matches_typist_id_is_cleared_idx" ON "typing_shoot_matches"("typist_id", "is_cleared");

-- AddForeignKey
ALTER TABLE "typing_shoot_matches" ADD CONSTRAINT "typing_shoot_matches_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_shoot_matches" ADD CONSTRAINT "typing_shoot_matches_shooter_id_fkey" FOREIGN KEY ("shooter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_shoot_matches" ADD CONSTRAINT "typing_shoot_matches_typist_id_fkey" FOREIGN KEY ("typist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
