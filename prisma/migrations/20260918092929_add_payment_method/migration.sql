-- AlterTable
ALTER TABLE `orders` ADD COLUMN `paymentMethod` ENUM('COD', 'ONLINE') NOT NULL DEFAULT 'COD';
