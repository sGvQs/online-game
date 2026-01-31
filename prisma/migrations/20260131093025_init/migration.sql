-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_idp" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supabase_uid" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "user_idp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_idp_supabase_uid_key" ON "user_idp"("supabase_uid");

-- AddForeignKey
ALTER TABLE "user_idp" ADD CONSTRAINT "user_idp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
