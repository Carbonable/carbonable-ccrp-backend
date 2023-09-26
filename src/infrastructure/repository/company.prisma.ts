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
    return this.companyFromPrisma(
      await this.prisma.company.findUnique({
        where: { id },
        include: { businessUnits: true },
      }),
    );
  }

  async save(company: Company): Promise<void> {
    const c = await this.prisma.company.findUnique({
      where: { id: company.id, slug: company.slug },
    });
    if (null !== c) {
      return;
    }
    await this.prisma.company.create({
      data: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        businessUnits: {
          create: [...company.businessUnits.map(mapBusinessUnitToPrisma)],
        },
      },
    });
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
      c.businessUnits.map(this.mapPrismaToBusinessUnit),
    );
  }
}

function mapBusinessUnitToPrisma(bu: BusinessUnit): any {
  return {
    id: bu.id,
    name: bu.name,
    description: bu.description,
    defaultEmission: bu.defaultEmission,
    defaultTarget: bu.defaultTarget,
    debt: bu.debt,
    metadata: JSON.stringify(bu.getMetatada()),
  };
}
