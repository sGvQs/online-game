/*
  Warnings:

  - You are about to drop the column `room_name` on the `room_deleted_notifications` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "room_deleted_notifications" DROP COLUMN "room_name";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "name";
