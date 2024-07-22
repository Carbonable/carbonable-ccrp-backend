import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { PaginationDTO } from '../carbon-credits/carbon-credits.resolver';
import Utils from '../../utils';

@Injectable()
export class ProjectFundingAllocationService {
  constructor(private readonly prismaClient: PrismaService) {}

  async get(pagination: PaginationDTO) {
    const { page = 1, count = 10 } = pagination;
    const projects = await this.prismaClient.project.findMany();
    let data = [];
    const currentYear = new Date().getFullYear();
    for (const project of projects) {
      const allocations = await this.prismaClient.allocation.findMany({
        where: { projectId: project.id },
      });
      const vintages = await this.prismaClient.vintage.findMany({
        where: { projectId: project.id },
      });
      data = [
        ...data,
        {
          id: project.id,
          name: project.name,
          color: project.color,
          allocation: allocations.reduce((acc, curr) => acc + curr.quantity, 0),
          generated_cc: vintages
            .filter((v) => parseInt(v.year) < currentYear)
            .reduce((acc, curr) => acc + curr.capacity, 0),
          forwarded_cc: vintages
            .filter((v) => parseInt(v.year) > currentYear)
            .reduce((acc, curr) => {
              return acc + curr.capacity;
            }, 0),
          retired_cc: vintages.reduce((acc, curr) => acc + curr.consumed, 0),
          comitted_cc: vintages.reduce((acc, curr) => acc + curr.reserved, 0),
        },
      ];
    }

    const project_count = await this.prismaClient.project.count();
    const paginationObject = {
      max_page: Math.ceil(project_count / count),
      page_number: page,
      count,
    };

    const formattedData = data.map((a) => ({
      ...a,
      allocation: Utils.formatString({ value: a.allocation, suffix: '%' }),
      generated_cc: Utils.formatString({ value: a.generated_cc, suffix: 'cc' }),
      forwarded_cc: Utils.formatString({ value: a.forwarded_cc, suffix: 'cc' }),
      retired_cc: Utils.formatString({ value: a.retired_cc, suffix: 'cc' }),
      comitted_cc: Utils.formatString({ value: a.comitted_cc, suffix: 'cc' }),
    }));

    return { data: formattedData, pagination: paginationObject };
  }
}
