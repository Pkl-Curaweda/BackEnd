/*
  Warnings:

  - You are about to drop the column `capacity` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `room` table. All the data in the column will be lost.
  - Added the required column `rate_code` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_capacity_id` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_status` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `room` DROP COLUMN `capacity`,
    DROP COLUMN `price`,
    ADD COLUMN `rate_code` DOUBLE NOT NULL,
    ADD COLUMN `room_capacity_id` INTEGER NOT NULL,
    ADD COLUMN `room_status` INTEGER NOT NULL;
