/*
  Warnings:

  - A unique constraint covering the columns `[pidx]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `pidx` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `payments_pidx_key` ON `payments`(`pidx`);
