-- CreateTable
CREATE TABLE "star_shield_user_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "total_typing_count" INTEGER NOT NULL DEFAULT 0,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "star_shield_user_special_attacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "star_shield_user_heal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "star_shield_user_heal_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "star_shield_user_progress_user_id_key" ON "star_shield_user_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "star_shield_user_normal_attacks_user_id_technique_id_key" ON "star_shield_user_normal_attacks"("user_id", "technique_id");

-- CreateIndex
CREATE UNIQUE INDEX "star_shield_user_special_attacks_user_id_special_attack_id_key" ON "star_shield_user_special_attacks"("user_id", "special_attack_id");

-- CreateIndex
CREATE UNIQUE INDEX "star_shield_user_heal_user_id_key" ON "star_shield_user_heal"("user_id");

-- CreateIndex
CREATE INDEX "star_shield_purchase_history_user_id_idx" ON "star_shield_purchase_history"("user_id");

-- AddForeignKey
ALTER TABLE "star_shield_user_progress" ADD CONSTRAINT "star_shield_user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_user_normal_attacks" ADD CONSTRAINT "star_shield_user_normal_attacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_user_special_attacks" ADD CONSTRAINT "star_shield_user_special_attacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_user_heal" ADD CONSTRAINT "star_shield_user_heal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "star_shield_purchase_history" ADD CONSTRAINT "star_shield_purchase_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
