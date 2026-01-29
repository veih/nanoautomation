-- CreateTable
CREATE TABLE `cms` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `localizacao` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamentos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `cmId` VARCHAR(191) NOT NULL,
    `status` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'DESATIVADO', 'DESCONHECIDO') NOT NULL DEFAULT 'OPERACIONAL',
    `imagePaths` VARCHAR(191) NULL,

    INDEX `equipamentos_cmId_fkey`(`cmId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cvfs` (
    `id` VARCHAR(191) NOT NULL,
    `vigaFria` VARCHAR(191) NULL,
    `piso` VARCHAR(191) NULL,
    `sensorTemperatura` ENUM('OPERACIONAL', 'DEFEITO', 'N_A') NOT NULL,
    `sensorUmidade` ENUM('OPERACIONAL', 'DEFEITO', 'N_A') NOT NULL,
    `localizacaoQuadro` VARCHAR(191) NULL,
    `localizacaoValvula` VARCHAR(191) NULL,
    `atuador` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `imagePaths` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atuadores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descricaoDefeito` VARCHAR(191) NULL,
    `equipamentoId` VARCHAR(191) NOT NULL,
    `estado` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'DESCONHECIDO') NULL DEFAULT 'OPERACIONAL',
    `imagePaths` VARCHAR(191) NULL,

    INDEX `atuadores_equipamentoId_fkey`(`equipamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `equipamentoId` VARCHAR(191) NOT NULL,
    `descricaoDefeito` VARCHAR(191) NULL,
    `estado` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'DESCONHECIDO') NULL DEFAULT 'OPERACIONAL',
    `imagePaths` VARCHAR(191) NULL,

    INDEX `sensores_equipamentoId_fkey`(`equipamentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lojas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `LUC` VARCHAR(191) NOT NULL,
    `localizacao` VARCHAR(191) NULL,
    `smart` VARCHAR(191) NULL,
    `idKron` VARCHAR(191) NULL,

    UNIQUE INDEX `lojas_LUC_key`(`LUC`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipamentos_loja` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `lojaId` VARCHAR(191) NOT NULL,
    `status` ENUM('OPERACIONAL', 'MANUTENCAO', 'DESATIVADO', 'DESCONHECIDO', 'DEFEITO') NOT NULL DEFAULT 'OPERACIONAL',
    `imagePaths` VARCHAR(191) NULL,

    INDEX `equipamentos_loja_lojaId_fkey`(`lojaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atuadores_loja` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `existe` BOOLEAN NOT NULL DEFAULT true,
    `motivoNaoExiste` VARCHAR(191) NULL,
    `lojaId` VARCHAR(191) NULL,
    `equipamentoLojaId` VARCHAR(191) NULL,
    `estado` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'DESCONHECIDO') NULL DEFAULT 'OPERACIONAL',

    INDEX `atuadores_loja_equipamentoLojaId_fkey`(`equipamentoLojaId`),
    INDEX `atuadores_loja_lojaId_fkey`(`lojaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensores_loja` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `ultimaAtivacao` DATETIME(3) NULL,
    `existe` BOOLEAN NOT NULL DEFAULT true,
    `motivoNaoExiste` VARCHAR(191) NULL,
    `lojaId` VARCHAR(191) NULL,
    `equipamentoLojaId` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,

    INDEX `sensores_loja_equipamentoLojaId_fkey`(`equipamentoLojaId`),
    INDEX `sensores_loja_lojaId_fkey`(`lojaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fire_detection_equipment_loja` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NULL,
    `existe` BOOLEAN NOT NULL,
    `lojaId` VARCHAR(191) NOT NULL,
    `comissionada` BOOLEAN NOT NULL,
    `tipoLoja` VARCHAR(191) NOT NULL,
    `lacoDetec` VARCHAR(191) NOT NULL,
    `v24Dc2` BOOLEAN NOT NULL,
    `stGas` BOOLEAN NOT NULL,
    `cmdAlarme` BOOLEAN NOT NULL,
    `stAlarme` BOOLEAN NOT NULL,
    `stFalha` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colaboradores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `funcao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `corretivas` (
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
CREATE TABLE `fotocorretiva` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `corretivaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FotoCorretiva_corretivaId_fkey`(`corretivaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_teatro` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `localizacao` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maquinas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `localizacao` VARCHAR(191) NULL,
    `status` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'DESATIVADO', 'DESCONHECIDO') NOT NULL DEFAULT 'OPERACIONAL',
    `cmsTeatroId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `imagePaths` VARCHAR(191) NULL,

    INDEX `maquinas_cmsTeatroId_fkey`(`cmsTeatroId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `atuadoresTeatro` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `status` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'DESCONHECIDO') NOT NULL DEFAULT 'OPERACIONAL',
    `maquinaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `atuadoresTeatro_maquinaId_fkey`(`maquinaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensores_teatro` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `status` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'DESCONHECIDO') NOT NULL DEFAULT 'OPERACIONAL',
    `maquinaId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sensores_teatro_maquinaId_fkey`(`maquinaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_controllers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'N_A') NOT NULL DEFAULT 'OPERACIONAL',
    `location` VARCHAR(191) NULL,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `imagePaths` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request_buttons` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'N_A') NOT NULL DEFAULT 'OPERACIONAL',
    `location` VARCHAR(191) NULL,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `controllerId` VARCHAR(191) NULL,
    `buttonType` VARCHAR(191) NULL DEFAULT 'ENTRY',
    `isPressed` BOOLEAN NOT NULL DEFAULT false,
    `lastPressed` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `imagePaths` TEXT NULL,

    INDEX `request_buttons_controllerId_fkey`(`controllerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `electromagnets` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'N_A') NOT NULL DEFAULT 'OPERACIONAL',
    `location` VARCHAR(191) NULL,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `controllerId` VARCHAR(191) NULL,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `lockStatus` VARCHAR(191) NULL DEFAULT 'LOCKED',
    `powerConsumption` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `imagePaths` TEXT NULL,

    INDEX `electromagnets_controllerId_fkey`(`controllerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `magnetic_sensors` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'N_A') NOT NULL DEFAULT 'OPERACIONAL',
    `location` VARCHAR(191) NULL,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `controllerId` VARCHAR(191) NULL,
    `sensorType` VARCHAR(191) NULL DEFAULT 'DOOR',
    `isClosed` BOOLEAN NOT NULL DEFAULT true,
    `lastTriggered` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `imagePaths` TEXT NULL,

    INDEX `magnetic_sensors_controllerId_fkey`(`controllerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `equipamentos` ADD CONSTRAINT `equipamentos_cmId_fkey` FOREIGN KEY (`cmId`) REFERENCES `cms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atuadores` ADD CONSTRAINT `atuadores_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores` ADD CONSTRAINT `sensores_equipamentoId_fkey` FOREIGN KEY (`equipamentoId`) REFERENCES `equipamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `fire_detection_equipment_loja` ADD CONSTRAINT `fire_detection_equipment_loja_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `lojas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fotocorretiva` ADD CONSTRAINT `FotoCorretiva_corretivaId_fkey` FOREIGN KEY (`corretivaId`) REFERENCES `corretivas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maquinas` ADD CONSTRAINT `maquinas_cmsTeatroId_fkey` FOREIGN KEY (`cmsTeatroId`) REFERENCES `cms_teatro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atuadoresTeatro` ADD CONSTRAINT `atuadoresTeatro_maquinaId_fkey` FOREIGN KEY (`maquinaId`) REFERENCES `maquinas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensores_teatro` ADD CONSTRAINT `sensores_teatro_maquinaId_fkey` FOREIGN KEY (`maquinaId`) REFERENCES `maquinas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_buttons` ADD CONSTRAINT `request_buttons_controllerId_fkey` FOREIGN KEY (`controllerId`) REFERENCES `access_controllers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `electromagnets` ADD CONSTRAINT `electromagnets_controllerId_fkey` FOREIGN KEY (`controllerId`) REFERENCES `access_controllers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magnetic_sensors` ADD CONSTRAINT `magnetic_sensors_controllerId_fkey` FOREIGN KEY (`controllerId`) REFERENCES `access_controllers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
