-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatarUrl` TEXT NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `headline` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Webinar` ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    ADD COLUMN `heroContext` TEXT NULL,
    ADD COLUMN `heroImage` TEXT NULL,
    ADD COLUMN `heroSubtitle` TEXT NULL,
    ADD COLUMN `heroTitle` TEXT NULL,
    ADD COLUMN `inviteLink` VARCHAR(191) NULL,
    ADD COLUMN `meetingId` VARCHAR(191) NULL,
    ADD COLUMN `mentorBio` TEXT NULL,
    ADD COLUMN `mentorImage` TEXT NULL,
    ADD COLUMN `mentorName` VARCHAR(191) NULL,
    ADD COLUMN `mentorRole` VARCHAR(191) NULL,
    ADD COLUMN `notificationActive` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `notificationText` TEXT NULL,
    ADD COLUMN `passcode` VARCHAR(191) NULL,
    ADD COLUMN `platform` VARCHAR(191) NULL,
    ADD COLUMN `price` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `WebinarRegistration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `webinarId` INTEGER NOT NULL,
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `razorpayOrderId` VARCHAR(191) NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'NOT_REQUIRED',

    UNIQUE INDEX `WebinarRegistration_razorpayOrderId_key`(`razorpayOrderId`),
    UNIQUE INDEX `WebinarRegistration_razorpayPaymentId_key`(`razorpayPaymentId`),
    UNIQUE INDEX `WebinarRegistration_userId_webinarId_key`(`userId`, `webinarId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebinarRoadmapItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `webinarId` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `highlight` VARCHAR(191) NULL,
    `description` JSON NOT NULL,
    `imageUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiTool` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `pricing` VARCHAR(191) NOT NULL,
    `websiteUrl` TEXT NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `idea` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'info',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WebinarRegistration` ADD CONSTRAINT `WebinarRegistration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WebinarRegistration` ADD CONSTRAINT `WebinarRegistration_webinarId_fkey` FOREIGN KEY (`webinarId`) REFERENCES `Webinar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WebinarRoadmapItem` ADD CONSTRAINT `WebinarRoadmapItem_webinarId_fkey` FOREIGN KEY (`webinarId`) REFERENCES `Webinar`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
