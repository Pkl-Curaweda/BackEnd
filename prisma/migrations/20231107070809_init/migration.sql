/*
  Warnings:

  - You are about to drop the column `refences` on the `lostfound` table. All the data in the column will be lost.
  - Added the required column `reference` to the `lostfound` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `lostfound` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lostfound` DROP COLUMN `refences`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `reference` VARCHAR(191) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
