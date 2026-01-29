-- Add missing sistema and categoria columns to corretivas table
ALTER TABLE `corretivas` ADD COLUMN `sistema` VARCHAR(191) NULL;
ALTER TABLE `corretivas` ADD COLUMN `categoria` VARCHAR(191) NULL;