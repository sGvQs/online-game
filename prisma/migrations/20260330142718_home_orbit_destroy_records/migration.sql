-- CreateTable
CREATE TABLE "home_orbit_destroy_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "difficulty" TEXT NOT NULL,
    "destroyed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_orbit_destroy_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "home_orbit_destroy_records_user_id_idx" ON "home_orbit_destroy_records"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "home_orbit_destroy_records_user_id_difficulty_key" ON "home_orbit_destroy_records"("user_id", "difficulty");

-- AddForeignKey
ALTER TABLE "home_orbit_destroy_records" ADD CONSTRAINT "home_orbit_destroy_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
