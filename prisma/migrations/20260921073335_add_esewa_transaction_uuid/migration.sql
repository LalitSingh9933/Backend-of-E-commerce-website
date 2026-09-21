/*
  Warnings:

  - A unique constraint covering the columns `[transactionUuid]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `transactionUuid` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `payments_transactionUuid_key` ON `payments`(`transactionUuid`);
