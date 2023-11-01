-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_type` ENUM('STANDARD', 'DELUXE', 'FAMILY') NOT NULL,
    `room_image` VARCHAR(191) NOT NULL,
    `room_code` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `floor` INTEGER NOT NULL,
    `i` INTEGER NOT NULL,
    `occupied_status` BOOLEAN NOT NULL,
    `overlook` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `bed_setup` VARCHAR(191) NOT NULL,
    `connecting` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomFacility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `roomId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductReq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `typeId` INTEGER NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `picture` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomFacility` ADD CONSTRAINT `RoomFacility_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductReq` ADD CONSTRAINT `ProductReq_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `SubType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
