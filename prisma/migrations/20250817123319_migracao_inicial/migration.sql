/*
  Warnings:

  - The primary key for the `atuadores` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `atuadores` table. All the data in the column will be lost.
  - The primary key for the `atuadores_loja` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `atuadores_loja` table. All the data in the column will be lost.
  - The primary key for the `cms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `cms` table. All the data in the column will be lost.
  - The primary key for the `equipamentos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `equipamentos` table. All the data in the column will be lost.
  - The primary key for the `equipamentos_loja` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `equipamentos_loja` table. All the data in the column will be lost.
  - The primary key for the `lojas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `lojas` table. All the data in the column will be lost.
  - The primary key for the `sensores` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `sensores` table. All the data in the column will be lost.
  - The primary key for the `sensores_loja` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `sensores_loja` table. All the data in the column will be lost.
  - The required column `id` was added to the `atuadores` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `atuadores_loja` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `cms` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `equipamentos` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `equipamentos_loja` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `lojas` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `sensores` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `sensores_loja` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `atuadores` DROP FOREIGN KEY `atuadores_equipamentoId_fkey`;

-- DropForeignKey
ALTER TABLE `atuadores_loja` DROP FOREIGN KEY `atuadores_loja_equipamentoLojaId_fkey`;

-- DropForeignKey
ALTER TABLE `atuadores_loja` DROP FOREIGN KEY `atuadores_loja_lojaId_fkey`;

-- DropForeignKey
ALTER TABLE `equipamentos` DROP FOREIGN KEY `equipamentos_cmId_fkey`;

-- DropForeignKey
ALTER TABLE `equipamentos_loja` DROP FOREIGN KEY `equipamentos_loja_lojaId_fkey`;

-- DropForeignKey
ALTER TABLE `sensores` DROP FOREIGN KEY `sensores_equipamentoId_fkey`;

-- DropForeignKey
ALTER TABLE `sensores_loja` DROP FOREIGN KEY `sensores_loja_equipamentoLojaId_fkey`;

-- DropForeignKey
ALTER TABLE `sensores_loja` DROP FOREIGN KEY `sensores_loja_lojaId_fkey`;

-- AlterTable
ALTER TABLE `atuadores` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `atuadores_loja` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `cms` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `equipamentos` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `equipamentos_loja` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `lojas` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `sensores` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `sensores_loja` DROP PRIMARY KEY,
    DROP COLUMN `_id`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_cmId_fkey` FOREIGN KEY (`cmId`) REFERENCES `cms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atuadores` ADD CONSTRAINT `atuadores_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores` ADD CONSTRAINT `sensores_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipamentos_loja` ADD CONSTRAINT `equipamentos_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atuadores_loja` ADD CONSTRAINT `atuadores_loja_equipamentoLojaId_fkey` FOREIGN KEY (`equipamentoLojaId`) REFERENCES `equipamentos_loja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atuadores_loja` ADD CONSTRAINT `atuadores_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores_loja` ADD CONSTRAINT `sensores_loja_equipamentoLojaId_fkey` FOREIGN KEY (`equipamentoLojaId`) REFERENCES `equipamentos_loja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores_loja` ADD CONSTRAINT `sensores_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
