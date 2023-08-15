-- CreateEnum
CREATE TYPE "CarbonCreditOrigin" AS ENUM ('FORWARD_FINANCE', 'DIRECT_PURCHASE');

-- CreateEnum
CREATE TYPE "CarbonCreditType" AS ENUM ('RESTORATION', 'CONCERVATION');

-- CreateEnum
CREATE TYPE "ProjectColor" AS ENUM ('BLUE', 'ORANGE', 'GREEN');

-- CreateEnum
CREATE TYPE "CarbonCreditAuditStatus" AS ENUM ('INITIAL', 'AUDITED');

-- CreateTable
CREATE TABLE "carbon_credits" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "vintage" VARCHAR(4) NOT NULL,
    "type" "CarbonCreditType" NOT NULL,
    "origin" "CarbonCreditOrigin" NOT NULL,
    "purchase_price" BIGINT,
    "is_retired" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "is_purchased" BOOLEAN NOT NULL DEFAULT false,
    "audit_status" "CarbonCreditAuditStatus" NOT NULL DEFAULT 'INITIAL',
    "project_id" TEXT NOT NULL,

    CONSTRAINT "carbon_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "localization" TEXT NOT NULL,
    "start_date" VARCHAR(4) NOT NULL,
    "end_date" VARCHAR(4) NOT NULL,
    "area" INTEGER NOT NULL,
    "type" "CarbonCreditType" NOT NULL,
    "origin" "CarbonCreditOrigin" NOT NULL,
    "funding_amount" BIGINT NOT NULL,
    "color" "ProjectColor" NOT NULL,
    "protected_species" INTEGER NOT NULL,
    "protected_forest" INTEGER NOT NULL,
    "allocation" INTEGER NOT NULL,
    "certifier_id" TEXT,
    "developper_id" TEXT,
    "country_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curve_point" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMPTZ NOT NULL,
    "absorption" DOUBLE PRECISION NOT NULL,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "curve_point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_emission" (
    "id" TEXT NOT NULL,
    "year" VARCHAR(4) NOT NULL,
    "emission" INTEGER NOT NULL,
    "target" INTEGER NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "company_emission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_configuration" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "company_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "certifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developper" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "developper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sdg" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "sdg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_sdgs" (
    "project_id" TEXT NOT NULL,
    "sdg_id" TEXT NOT NULL,

    CONSTRAINT "projects_sdgs_pkey" PRIMARY KEY ("project_id","sdg_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_slug_key" ON "company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "certifier_slug_key" ON "certifier"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "developper_slug_key" ON "developper"("slug");

-- AddForeignKey
ALTER TABLE "carbon_credits" ADD CONSTRAINT "carbon_credits_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_certifier_id_fkey" FOREIGN KEY ("certifier_id") REFERENCES "certifier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_developper_id_fkey" FOREIGN KEY ("developper_id") REFERENCES "developper"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curve_point" ADD CONSTRAINT "curve_point_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_emission" ADD CONSTRAINT "company_emission_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_configuration" ADD CONSTRAINT "company_configuration_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_sdgs" ADD CONSTRAINT "projects_sdgs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_sdgs" ADD CONSTRAINT "projects_sdgs_sdg_id_fkey" FOREIGN KEY ("sdg_id") REFERENCES "sdg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
