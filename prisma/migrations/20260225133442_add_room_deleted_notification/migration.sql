-- CreateTable
CREATE TABLE "room_deleted_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "room_name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "room_deleted_notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "room_deleted_notifications" ADD CONSTRAINT "room_deleted_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
