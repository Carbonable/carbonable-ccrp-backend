-- CreateEnum
CREATE TYPE "CarbonCreditOrigin" AS ENUM ('FORWARD_FINANCE', 'DIRECT_PURCHASE');

-- CreateEnum
CREATE TYPE "CarbonCreditType" AS ENUM ('RESTORATION', 'CONCERVATION');

-- CreateTable
CREATE TABLE "carbon_credits" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "vintage" VARCHAR(4) NOT NULL,
    "type" "CarbonCreditType" NOT NULL,
    "origin" "CarbonCreditOrigin" NOT NULL,
    "isRetired" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT NOT NULL,

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
    "certifier_id" TEXT,
    "developper_id" TEXT,
    "country_id" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_configuration" (
    "id" TEXT NOT NULL,
    "year" VARCHAR(4) NOT NULL,
    "emission" INTEGER NOT NULL,
    "target" INTEGER NOT NULL,
    "project_id" TEXT NOT NULL,
    "certifier_id" TEXT NOT NULL,

    CONSTRAINT "project_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "company_slug_key" ON "company"("slug");

-- AddForeignKey
ALTER TABLE "carbon_credits" ADD CONSTRAINT "carbon_credits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_certifier_id_fkey" FOREIGN KEY ("certifier_id") REFERENCES "certifier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_developper_id_fkey" FOREIGN KEY ("developper_id") REFERENCES "developper"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_configuration" ADD CONSTRAINT "project_configuration_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_configuration" ADD CONSTRAINT "project_configuration_certifier_id_fkey" FOREIGN KEY ("certifier_id") REFERENCES "certifier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_configuration" ADD CONSTRAINT "company_configuration_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
