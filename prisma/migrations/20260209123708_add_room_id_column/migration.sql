/*
  Warnings:

  - Added the required column `room_id` to the `error_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "error_events" ADD COLUMN     "room_id" UUID NOT NULL;
