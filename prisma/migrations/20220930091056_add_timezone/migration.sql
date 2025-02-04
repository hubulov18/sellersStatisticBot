/*
  Warnings:

  - Made the column `timezone` on table `TelegramUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TelegramUser" ADD COLUMN     "initHour" VARCHAR(200) NOT NULL DEFAULT E'9:00',
ALTER COLUMN "timezone" SET NOT NULL,
ALTER COLUMN "timezone" SET DEFAULT E'Москва UTC-3';
