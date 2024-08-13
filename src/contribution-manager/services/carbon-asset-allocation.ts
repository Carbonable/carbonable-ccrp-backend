import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { Prisma, Stock as StockModel } from '@prisma/client';
import { Vintage } from '../../domain/portfolio';
import { BusinessUnitRepositoryInterface } from '../../domain/business-unit';
import { BUSINESS_UNIT_REPOSITORY } from '../../infrastructure/repository/business-unit.prisma';
import { Metadata, MetadataParser } from '../../domain/common/metadata-parser';
import Utils from '../../utils';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '../../domain/portfolio/project-repository.interface';

export type AllocationTarget = {
  id: string;
  name: string;
  metadata: Metadata<string, string>[];
};
type ProjectCarbonAssetAllocationItem = {
  business_unit: AllocationTarget;
  allocated: number;
  allocation_amount: number;
  target: number;
  actual: number;
  start_date: string;
};
type BusinessUnitCarbonAssetAllocationItem = {
  project: AllocationTarget;
  total_cu: number;
  allocated: number;
  generated: number;
  forward: number;
  retired: number;
};

@Injectable()
export class CarbonAssetAllocationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(BUSINESS_UNIT_REPOSITORY)
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryInterface,
  ) {}

  async getProject(id: string, pagination: any) {
    return Utils.paginate(await this.fetchProjectWide(id), pagination);
  }
  async getBusinessUnit(id: string, pagination: any) {
    return Utils.paginate(await this.fetchBusinessUnitWide(id), pagination);
  }

  async fetchBusinessUnitWide(
    businessUnitId: string,
  ): Promise<BusinessUnitCarbonAssetAllocationItem[]> {
    const allocations = await this.prisma.allocation.findMany({
      where: { businessUnitId },
      include: { project: true, businessUnit: true, stock: true },
    });

    const now = new Date().getFullYear();

    const res = [];
    for (const a of allocations) {
      const metadata = getMetadata(a.businessUnit.metadata);

      res.push({
        project: {
          id: a.project.id,
          name: a.project.name,
          metadata,
        },
        total_cu: a.stock.reduce(
          (acc, curr) => acc + curr.quantity + curr.purchased,
          0,
        ),
        allocated: a.quantity,
        generated: a.stock.reduce(
          (acc, curr) =>
            parseInt(curr.vintage) <= now ? acc + curr.quantity : acc,
          0,
        ),
        forward: a.stock.reduce(
          (acc, curr) =>
            parseInt(curr.vintage) >= now ? acc + curr.quantity : acc,
          0,
        ),
        retired: a.stock.reduce((acc, curr) => acc + curr.retired, 0),
      });
    }

    return res;
  }

  async fetchProjectWide(
    projectId: string,
  ): Promise<ProjectCarbonAssetAllocationItem[]> {
    const now = new Date().getFullYear();
    const allocations = await this.prisma.allocation.findMany({
      where: { projectId },
      include: {
        project: true,
        businessUnit: true,
        stock: true,
      },
    });
    const res = [];
    for (const a of allocations) {
      const businessUnit = await this.businessUnitRepository.byId(
        a.businessUnit.id,
      );
      const target =
        businessUnit.getTargets().find((t) => t.year === now).target ??
        businessUnit.defaultTarget;
      const metadata = getMetadata(a.project.metadata);
      res.push({
        business_unit: {
          id: a.businessUnit.id,
          name: a.businessUnit.name,
          metadata,
        },
        allocated: a.stock.reduce((acc, curr) => acc + curr.quantity, 0),
        allocation_amount: a.quantity,
        target,
        actual: a.stock.reduce((acc, curr) => acc + curr.consumed, 0),
        start_date: a.allocatedAt.toLocaleString('fr-FR'),
      });
    }
    return res;
  }

  async getCompanyWide(companyId: string, pagination: any) {
    const businessUnits = await this.businessUnitRepository.byCompanyId(
      companyId,
    );
    const allocations = await this.prisma.allocation.findMany({
      where: { businessUnitId: { in: businessUnits.map((bu) => bu.id) } },
      include: {
        project: true,
        businessUnit: true,
        stock: true,
      },
    });

    const res = [];
    for (const a of allocations) {
      const project = a.project;
      const projectVintage = await this.projectRepository.findOneByIdentifier(
        project.id,
      );
      const total_potential = projectVintage.vintages.reduce(
        (acc, curr) => acc + curr.capacity,
        0,
      );

      const price =
        a.stock.reduce(
          (acc, curr) => acc + Utils.priceDecimal(curr.issuedPrice),
          0,
        ) / a.stock.length;

      const allocated = a.stock.reduce((acc, curr) => acc + curr.quantity, 0);

      const now = new Date().getFullYear();
      const startDate = parseInt(project.startDate);
      const endDate = parseInt(project.endDate);
      res.push({
        project_name: project.name,
        business_units: businessUnits.map((bu) => ({
          id: bu.id,
          name: bu.name,
          metadata: bu.getMetadata(),
        })),
        type: project.type,
        total_potential,
        ex_post_to_date: Vintage.exPostStockAt(prismaToVintage(a.stock)),
        ex_ante_to_date: Vintage.exAnteStockAt(prismaToVintage(a.stock)),
        project_completion: Utils.formatString({
          value: ((100 * (now - startDate)) / (endDate - startDate)).toString(),
          suffix: '%',
        }),
        total_allocated_to_date: allocated,
        total_available_to_date: total_potential - allocated,
        allocation_rate: Utils.formatString({
          value: (0 === total_potential
            ? 0
            : (100 * allocated) / total_potential
          ).toString(),
          suffix: '%',
        }),
        price,
        total_amount: total_potential * price,
      });
    }

    return Utils.paginate(res, pagination);
  }
}

export function getMetadata(
  metadata: Prisma.JsonValue,
): Metadata<string, string>[] {
  if ('object' === typeof metadata) {
    return MetadataParser.fromObject(metadata);
  }
  return Object.keys(metadata).length === 0
    ? []
    : JSON.parse(metadata as string);
}
export function prismaToVintage(vintages: StockModel[]): Vintage[] {
  return vintages.map((v) => {
    const vintage = new Vintage(
      v.id,
      v.vintage,
      v.quantity,
      v.purchased,
      v.purchasedPrice,
      v.issuedPrice,
    );
    vintage.lock(v.consumed);
    return vintage;
  });
}
