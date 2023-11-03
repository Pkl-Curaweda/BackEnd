-- CreateTable
CREATE TABLE `Reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agencyName` VARCHAR(191) NOT NULL,
    `resvQtyId` INTEGER NOT NULL,
    `resvStatusId` INTEGER NOT NULL,
    `groupReservation` BOOLEAN NOT NULL,
    `finishedReservation` BOOLEAN NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `reserverId` INTEGER NOT NULL,
    `fixRate` BOOLEAN NOT NULL,
    `m` VARCHAR(191) NOT NULL,
    `l` VARCHAR(191) NOT NULL,
    `argtCode` VARCHAR(191) NOT NULL,
    `day` INTEGER NOT NULL,
    `night` INTEGER NOT NULL,
    `arrivalDate` DATETIME(3) NOT NULL,
    `departureDate` DATETIME(3) NOT NULL,
    `checkoutDate` DATETIME(3) NOT NULL,
    `canceledDate` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reserver` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupName` VARCHAR(191) NOT NULL,
    `kCard` VARCHAR(191) NOT NULL,
    `nation` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `resident` VARCHAR(191) NOT NULL,
    `guestId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResvFlight` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservationId` INTEGER NOT NULL,
    `arrivalFlight` DATETIME(3) NOT NULL,
    `departureFlight` DATETIME(3) NOT NULL,
    `pickedUp` BOOLEAN NOT NULL,
    `drop` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResvRoom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `note` TEXT NOT NULL,
    `reservationId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResvQty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `manyAdult` INTEGER NOT NULL,
    `manyChild` INTEGER NOT NULL,
    `manyRoom` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResvStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `desc` TEXT NOT NULL,
    `hexCode` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_resvQtyId_fkey` FOREIGN KEY (`resvQtyId`) REFERENCES `ResvQty`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_resvStatusId_fkey` FOREIGN KEY (`resvStatusId`) REFERENCES `ResvStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_reserverId_fkey` FOREIGN KEY (`reserverId`) REFERENCES `Reserver`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResvFlight` ADD CONSTRAINT `ResvFlight_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `Reservation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResvRoom` ADD CONSTRAINT `ResvRoom_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResvRoom` ADD CONSTRAINT `ResvRoom_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `Reservation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
