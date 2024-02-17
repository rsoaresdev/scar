-- AlterTable
ALTER TABLE "invests" ALTER COLUMN "investAmount" DROP NOT NULL,
ALTER COLUMN "investEnterprise" DROP NOT NULL,
ALTER COLUMN "investTime" DROP NOT NULL;
