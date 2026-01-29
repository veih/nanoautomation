/*
  Warnings:

  - You are about to alter the column `estado` on the `atuadores_loja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `atuadores_loja` MODIFY `estado` ENUM('OPERACIONAL', 'DEFEITO', 'MANUTENCAO', 'DESCONHECIDO') NULL DEFAULT 'OPERACIONAL';
