-- CreateTable
CREATE TABLE `lojas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `LUC` VARCHAR(191) NOT NULL,
    `localizacao` VARCHAR(191) NULL,

    UNIQUE INDEX `lojas_LUC_key`(`LUC`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamentos_loja` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `lojaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atuadores_loja` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `valorAtual` DOUBLE NOT NULL,
    `existe` BOOLEAN NOT NULL DEFAULT true,
    `motivoNaoExiste` VARCHAR(191) NULL,
    `lojaId` VARCHAR(191) NULL,
    `equipamentoLojaId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensores_loja` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `valorAtual` DOUBLE NULL,
    `ultimaAtivacao` DATETIME(3) NULL,
    `existe` BOOLEAN NOT NULL DEFAULT true,
    `motivoNaoExiste` VARCHAR(191) NULL,
    `lojaId` VARCHAR(191) NULL,
    `equipamentoLojaId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `equipamentos_loja` ADD CONSTRAINT `equipamentos_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atuadores_loja` ADD CONSTRAINT `atuadores_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atuadores_loja` ADD CONSTRAINT `atuadores_loja_equipamentoLojaId_fkey` FOREIGN KEY (`equipamentoLojaId`) REFERENCES `equipamentos_loja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores_loja` ADD CONSTRAINT `sensores_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores_loja` ADD CONSTRAINT `sensores_loja_equipamentoLojaId_fkey` FOREIGN KEY (`equipamentoLojaId`) REFERENCES `equipamentos_loja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
