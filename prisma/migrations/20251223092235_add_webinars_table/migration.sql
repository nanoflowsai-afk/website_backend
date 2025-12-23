-- CreateTable
CREATE TABLE `Webinar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `speaker` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `registeredCount` INTEGER NOT NULL DEFAULT 0,
    `maxCapacity` INTEGER NOT NULL DEFAULT 100,
    `isLandingPage` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
