import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
  ForecastEmission,
  ForecastTarget,
} from '../../domain/business-unit';
import {
  BusinessUnit as BusinessUnitModel,
  ForecastTarget as ForecastTargetModel,
  ForecastEmission as ForecastEmissionModel,
  Allocation as AllocationModel,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { Allocation } from '../../domain/allocation';

export const BUSINESS_UNIT_REPOSITORY = 'BUSINESS_UNIT_REPOSITORY';

export class PrismaBusinessUnitRepository
  implements BusinessUnitRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async byId(id: string): Promise<BusinessUnit> {
    const dbModel = await this.prisma.businessUnit.findUnique({
      where: { id },
      include: {
        forecastTargets: true,
        forecastEmissions: true,
      },
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
        include: {
          forecastTargets: true,
          forecastEmissions: true,
        },
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

  async byAllocationIds(ids: string[]): Promise<BusinessUnit[]> {
    return prismaToBusinessUnit(
      await this.prisma.businessUnit.findMany({
        where: { allocations: { some: { id: { in: ids } } } },
        include: {
          forecastEmissions: true,
          forecastTargets: true,
        },
      }),
    );
  }

  async byAllocatedProjects(projectId: string): Promise<BusinessUnit[]> {
    return prismaToBusinessUnit(
      await this.prisma.businessUnit.findMany({
        where: {
          allocations: { some: { projectId } },
        },
        include: {
          forecastEmissions: true,
          forecastTargets: true,
        },
      }),
    );
  }
}

export function prismaToBusinessUnit(bus: BusinessUnitModel[]): BusinessUnit[] {
  return bus.map((b) => {
    const metadata =
      typeof b.metadata === 'string' ? JSON.parse(b.metadata) : b.metadata;

    const bu = new BusinessUnit(
      b.id,
      b.name,
      b.description,
      b.defaultEmission,
      b.defaultTarget,
      b.debt,
      b.companyId,
      metadata,
    );
    bu.addTargets(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      b.forecastTargets.map(
        (t: ForecastTargetModel) =>
          new ForecastTarget(t.year, t.quantity, t.id),
      ),
    );
    bu.addForecastEmissions(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      b.forecastEmissions.map(
        (e: ForecastEmissionModel) =>
          new ForecastEmission(e.year, e.quantity, e.id),
      ),
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (b.allocations && b.allocations.length > 0) {
      bu.addAllocations(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        b.allocations.map(
          (a: AllocationModel) =>
            new Allocation(
              a.id,
              a.projectId,
              a.businessUnitId,
              a.quantity,
              a.allocatedAt,
            ),
        ),
      );
    }

    return bu;
  });
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
    metadata: JSON.stringify(bu.getMetadata()),
  };
}
