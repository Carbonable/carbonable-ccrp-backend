/*
  Warnings:

  - The values [INITIAL] on the enum `CarbonCreditAuditStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONCERVATION] on the enum `CarbonCreditType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `allocation` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the `company_emission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `curve_point` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `metadata` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `risk_analysis` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'PENDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('INITIAL', 'RE_ALLOCATED');

-- AlterEnum
BEGIN;
CREATE TYPE "CarbonCreditAuditStatus_new" AS ENUM ('PROJECTED', 'CONFIRMED', 'AUDITED');
ALTER TABLE "carbon_credits" ALTER COLUMN "audit_status" DROP DEFAULT;
ALTER TABLE "carbon_credits" ALTER COLUMN "audit_status" TYPE "CarbonCreditAuditStatus_new" USING ("audit_status"::text::"CarbonCreditAuditStatus_new");
ALTER TYPE "CarbonCreditAuditStatus" RENAME TO "CarbonCreditAuditStatus_old";
ALTER TYPE "CarbonCreditAuditStatus_new" RENAME TO "CarbonCreditAuditStatus";
DROP TYPE "CarbonCreditAuditStatus_old";
ALTER TABLE "carbon_credits" ALTER COLUMN "audit_status" SET DEFAULT 'PROJECTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CarbonCreditType_new" AS ENUM ('RESTORATION', 'CONSERVATION', 'REFORESTATION', 'DAC', 'BIOCHAR', 'SOLAR_PANEL');
ALTER TABLE "carbon_credits" ALTER COLUMN "type" TYPE "CarbonCreditType_new" USING ("type"::text::"CarbonCreditType_new");
ALTER TABLE "projects" ALTER COLUMN "type" TYPE "CarbonCreditType_new" USING ("type"::text::"CarbonCreditType_new");
ALTER TYPE "CarbonCreditType" RENAME TO "CarbonCreditType_old";
ALTER TYPE "CarbonCreditType_new" RENAME TO "CarbonCreditType";
DROP TYPE "CarbonCreditType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "ProjectColor" ADD VALUE 'NA';

-- DropForeignKey
ALTER TABLE "company_emission" DROP CONSTRAINT "company_emission_company_id_fkey";

-- DropForeignKey
ALTER TABLE "curve_point" DROP CONSTRAINT "curve_point_project_id_fkey";

-- AlterTable
ALTER TABLE "carbon_credits" ADD COLUMN     "allocationId" TEXT,
ALTER COLUMN "audit_status" SET DEFAULT 'PROJECTED';

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "allocation",
ADD COLUMN     "metadata" JSONB NOT NULL,
ADD COLUMN     "risk_analysis" VARCHAR(4) NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "funding_amount" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "company_emission";

-- DropTable
DROP TABLE "curve_point";

-- CreateTable
CREATE TABLE "projection_snapshot" (
    "id" TEXT NOT NULL,
    "vintage" VARCHAR(4) NOT NULL,
    "emissions" BIGINT NOT NULL,
    "target" BIGINT NOT NULL,
    "effective_compensation" BIGINT NOT NULL,
    "ex_ante_count" BIGINT NOT NULL,
    "ex_post_count" BIGINT NOT NULL,
    "confirmed_count" BIGINT NOT NULL,
    "average_purchased_price" BIGINT NOT NULL,
    "total_purchased_price" BIGINT NOT NULL,
    "average_issued_price" BIGINT NOT NULL,
    "total_issued_price" BIGINT NOT NULL,
    "gran_total_amount" BIGINT NOT NULL,
    "emission_debt_estimated" BIGINT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "projection_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historical_projection_snapshots" (
    "id" TEXT NOT NULL,
    "vintage" VARCHAR(4) NOT NULL,
    "emissions" BIGINT NOT NULL,
    "target" BIGINT NOT NULL,
    "effective_compensation" BIGINT NOT NULL,
    "ex_ante_count" BIGINT NOT NULL,
    "ex_post_count" BIGINT NOT NULL,
    "confirmed_count" BIGINT NOT NULL,
    "average_purchased_price" BIGINT NOT NULL,
    "total_purchased_price" BIGINT NOT NULL,
    "average_issued_price" BIGINT NOT NULL,
    "total_issued_price" BIGINT NOT NULL,
    "gran_total_amount" BIGINT NOT NULL,
    "emission_debt_estimated" BIGINT NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "historical_projection_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "default_emission" INTEGER NOT NULL,
    "default_target" INTEGER NOT NULL,
    "debt" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "business_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecast_emission" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "business_unit_id" TEXT NOT NULL,

    CONSTRAINT "forecast_emission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecast_target" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "business_unit_id" TEXT NOT NULL,

    CONSTRAINT "forecast_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "deficit" INTEGER,
    "order_status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
    "business_unit_id" TEXT NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "business_unit_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock" (
    "id" TEXT NOT NULL,
    "vintage" VARCHAR(4) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "available" INTEGER NOT NULL DEFAULT 0,
    "consumed" INTEGER NOT NULL DEFAULT 0,
    "purchased" INTEGER NOT NULL DEFAULT 0,
    "purchased_price" INTEGER NOT NULL DEFAULT 0,
    "issued_price" INTEGER NOT NULL DEFAULT 0,
    "retired" INTEGER NOT NULL DEFAULT 0,
    "business_unit_id" TEXT,
    "project_id" TEXT NOT NULL,
    "allocation_id" TEXT,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vintage" (
    "id" TEXT NOT NULL,
    "year" VARCHAR(4) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "available" INTEGER NOT NULL,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "consumed" INTEGER NOT NULL DEFAULT 0,
    "purchased" INTEGER NOT NULL DEFAULT 0,
    "purchased_price" INTEGER NOT NULL DEFAULT 0,
    "issued_price" INTEGER NOT NULL DEFAULT 0,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "vintage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "order_id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "reservation_for_year" TEXT NOT NULL,
    "vintage" TEXT NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "execution_date" TIMESTAMPTZ NOT NULL,
    "order_id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,

    CONSTRAINT "execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" TEXT[],

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forecast_emission_year_business_unit_id_key" ON "forecast_emission"("year", "business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "forecast_target_year_business_unit_id_key" ON "forecast_target"("year", "business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_year_business_unit_id_key" ON "order"("year", "business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_name_key" ON "user"("name");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- AddForeignKey
ALTER TABLE "carbon_credits" ADD CONSTRAINT "carbon_credits_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "allocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projection_snapshot" ADD CONSTRAINT "projection_snapshot_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historical_projection_snapshots" ADD CONSTRAINT "historical_projection_snapshots_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_unit" ADD CONSTRAINT "business_unit_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_emission" ADD CONSTRAINT "forecast_emission_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_target" ADD CONSTRAINT "forecast_target_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation" ADD CONSTRAINT "allocation_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation" ADD CONSTRAINT "allocation_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "allocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vintage" ADD CONSTRAINT "vintage_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution" ADD CONSTRAINT "execution_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution" ADD CONSTRAINT "execution_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
