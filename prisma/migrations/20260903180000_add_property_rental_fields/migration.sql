-- AlterTable: rental / commercial listing fields added to Property in schema
-- but never migrated (local DB got them via `prisma db push`).
ALTER TABLE "properties" ADD COLUMN     "commercialUse" TEXT,
ADD COLUMN     "deposit" INTEGER,
ADD COLUMN     "floorLevel" TEXT,
ADD COLUMN     "leaseTerm" TEXT,
ADD COLUMN     "petsAllowed" BOOLEAN,
ADD COLUMN     "utilitiesIncluded" BOOLEAN;
