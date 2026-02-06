/*
  Warnings:

  - Added the required column `position_x` to the `error_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_y` to the `error_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "error_events" ADD COLUMN     "position_x" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "position_y" DOUBLE PRECISION NOT NULL;
