import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
} from '../../domain/business-unit';
import { BusinessUnit as BusinessUnitModel } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export const BUSINESS_UNIT_REPOSITORY = 'BUSINESS_UNIT_REPOSITORY';

export class PrismaBusinessUnitRepository
  implements BusinessUnitRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async byId(id: string): Promise<BusinessUnit> {
    const dbModel = await this.prisma.businessUnit.findUnique({
      where: { id },
    });
    if (null === dbModel) {
      return null;
    }

    return prismaToBusinessUnit([dbModel]).pop();
  }

  async byCompanyId(companyId: string): Promise<BusinessUnit[]> {
    return prismaToBusinessUnit(
      await this.prisma.businessUnit.findMany({
        where: { companyId },
      }),
    );
  }

  async save(businessUnit: BusinessUnit): Promise<void> {
    await this.prisma.businessUnit.upsert({
      where: { id: businessUnit.id },
      create: {
        ...mapBusinessUnitToPrisma(businessUnit),
      },
      update: {
        ...mapBusinessUnitToPrisma(businessUnit),
      },
    });
    for (const target of businessUnit.getTargets()) {
      await this.prisma.forecastTarget.upsert({
        where: {
          year_businessUnitId: {
            businessUnitId: businessUnit.id,
            year: target.year,
          },
        },
        create: {
          id: target.id,
          year: target.year,
          quantity: target.target,
          businessUnitId: businessUnit.id,
        },
        update: {
          year: target.year,
          quantity: target.target,
          businessUnitId: businessUnit.id,
        },
      });
    }
    for (const target of businessUnit.getForecastEmissions()) {
      await this.prisma.forecastEmission.upsert({
        where: {
          year_businessUnitId: {
            businessUnitId: businessUnit.id,
            year: target.year,
          },
        },
        create: {
          id: target.id,
          year: target.year,
          quantity: target.emission,
          businessUnitId: businessUnit.id,
        },
        update: {
          year: target.year,
          quantity: target.emission,
          businessUnitId: businessUnit.id,
        },
      });
    }
  }
}

function prismaToBusinessUnit(bus: BusinessUnitModel[]): BusinessUnit[] {
  return bus.map(
    (b) =>
      new BusinessUnit(
        b.id,
        b.name,
        b.description,
        b.defaultEmission,
        b.defaultTarget,
        b.debt,
        b.companyId,
        JSON.parse(b.metadata.toString()),
      ),
  );
}

export function mapBusinessUnitToPrisma(bu: BusinessUnit): any {
  return {
    id: bu.id,
    name: bu.name,
    description: bu.description,
    defaultEmission: bu.defaultEmission,
    defaultTarget: bu.defaultTarget,
    debt: bu.debt,
    companyId: bu.companyId,
    metadata: JSON.stringify(bu.getMetatada()),
  };
}
