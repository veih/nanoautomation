/*
  Warnings:

  - You are about to alter the column `estado` on the `atuadores_loja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- DropForeignKey
ALTER TABLE `atuadores_loja` DROP FOREIGN KEY `atuadores_loja_equipamentoLojaId_fkey`;

-- DropForeignKey
ALTER TABLE `atuadores_loja` DROP FOREIGN KEY `atuadores_loja_lojaId_fkey`;

-- DropForeignKey
ALTER TABLE `equipamentos_loja` DROP FOREIGN KEY `equipamentos_loja_lojaId_fkey`;

-- DropForeignKey
ALTER TABLE `sensores_loja` DROP FOREIGN KEY `sensores_loja_equipamentoLojaId_fkey`;

-- DropForeignKey
ALTER TABLE `sensores_loja` DROP FOREIGN KEY `sensores_loja_lojaId_fkey`;

-- AlterTable
ALTER TABLE `atuadores_loja` MODIFY `estado` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'DESCONHECIDO') NULL DEFAULT 'OPERACIONAL';

-- CreateTable
CREATE TABLE `Corretivas` (
    `id` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `local` VARCHAR(191) NOT NULL,
    `colaborador` VARCHAR(191) NULL,
    `solicitacao` VARCHAR(191) NOT NULL,
    `solicitante` VARCHAR(191) NOT NULL,
    `status` ENUM('ANDAMENTO', 'ESPERA', 'CONCLUIDO') NOT NULL,
    `dataConclusao` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FotoCorretiva` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `corretivaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colaboradores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `funcao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `equipamentos_loja` ADD CONSTRAINT `equipamentos_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atuadores_loja` ADD CONSTRAINT `atuadores_loja_equipamentoLojaId_fkey` FOREIGN KEY (`equipamentoLojaId`) REFERENCES `equipamentos_loja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atuadores_loja` ADD CONSTRAINT `atuadores_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores_loja` ADD CONSTRAINT `sensores_loja_equipamentoLojaId_fkey` FOREIGN KEY (`equipamentoLojaId`) REFERENCES `equipamentos_loja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores_loja` ADD CONSTRAINT `sensores_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FotoCorretiva` ADD CONSTRAINT `FotoCorretiva_corretivaId_fkey` FOREIGN KEY (`corretivaId`) REFERENCES `Corretivas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
