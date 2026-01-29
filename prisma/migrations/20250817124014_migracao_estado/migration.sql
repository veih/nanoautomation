/*
  Warnings:

  - You are about to alter the column `estado` on the `atuadores_loja` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `atuadores_loja` MODIFY `estado` VARCHAR(191) NULL;
