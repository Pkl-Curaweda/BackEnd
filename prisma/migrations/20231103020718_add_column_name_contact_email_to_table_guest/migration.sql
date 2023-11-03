/*
  Warnings:

  - You are about to drop the column `room_number` on the `order` table. All the data in the column will be lost.
  - Added the required column `contact` to the `Guest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Guest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Guest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `guest` ADD COLUMN `contact` INTEGER NOT NULL,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `room_number`,
    ADD COLUMN `roomId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
