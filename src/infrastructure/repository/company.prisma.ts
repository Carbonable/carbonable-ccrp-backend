import {
  BusinessUnit,
  Company,
  CompanyRepositoryInterface,
} from '../../domain/business-unit';
import { PrismaService } from '../prisma.service';

export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';

export class PrismaCompanyRepository implements CompanyRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async byId(id: string): Promise<Company> {
    const dbModel = await this.prisma.company.findUnique({
      where: { id },
      include: { businessUnits: true },
    });
    if (null === dbModel) {
      return null;
    }
    return this.companyFromPrisma(dbModel);
  }

  async byName(name: string): Promise<Company> {
    return this.companyFromPrisma(
      await this.prisma.company.findFirst({
        where: { name },
        include: { businessUnits: true },
      }),
    );
  }

  async save(company: Company): Promise<void> {
    await this.prisma.company.upsert({
      where: { slug: company.slug },
      update: {
        name: company.name,
        slug: company.slug,
        businessUnits: {
          connectOrCreate: [
            ...company.businessUnits.map(mapBusinessUnitToPrisma),
          ],
        },
      },
      create: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        businessUnits: {
          connectOrCreate: [
            ...company.businessUnits.map(mapBusinessUnitToPrisma),
          ],
        },
      },
    });
  }

  async byBusinessUnitId(id: string): Promise<Company> {
    return this.companyFromPrisma(
      await this.prisma.company.findFirst({
        where: { businessUnits: { some: { id } } },
        include: { businessUnits: true },
      }),
    );
  }

  async byAllocationIds(ids: string[]): Promise<Company[]> {
    const companies = await this.prisma.company.findMany({
      where: {
        businessUnits: {
          some: { allocations: { some: { id: { in: ids } } } },
        },
      },
      include: { businessUnits: true },
    });
    return companies.map(this.companyFromPrisma.bind(this));
  }

  mapPrismaToBusinessUnit(bu: any): BusinessUnit {
    return new BusinessUnit(
      bu.id,
      bu.name,
      bu.description,
      bu.defaultEmission,
      bu.defaultTarget,
      bu.debt,
      bu.companyId,
      JSON.parse(bu.metadata.toString()),
    );
  }

  companyFromPrisma(c: any): Company {
    return new Company(
      c.id,
      c.name,
      c.businessUnits.map(this.mapPrismaToBusinessUnit.bind(this)),
    );
  }
}

function mapBusinessUnitToPrisma(bu: BusinessUnit): any {
  return {
    where: { id: bu.id },
    create: {
      id: bu.id,
      name: bu.name,
      description: bu.description,
      defaultEmission: bu.defaultEmission,
      defaultTarget: bu.defaultTarget,
      debt: bu.debt,
      metadata: JSON.stringify(bu.getMetadata()),
    },
  };
}
