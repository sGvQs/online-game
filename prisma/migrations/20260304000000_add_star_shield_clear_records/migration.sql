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

-- CreateIndex
CREATE INDEX "star_shield_clear_records_shooter_id_typist_id_idx" ON "star_shield_clear_records"("shooter_id", "typist_id");

-- CreateIndex
CREATE INDEX "star_shield_clear_records_typist_id_shooter_id_idx" ON "star_shield_clear_records"("typist_id", "shooter_id");

-- AddForeignKey
ALTER TABLE "star_shield_clear_records" ADD CONSTRAINT "star_shield_clear_records_shooter_id_fkey" FOREIGN KEY ("shooter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_clear_records" ADD CONSTRAINT "star_shield_clear_records_typist_id_fkey" FOREIGN KEY ("typist_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
