import {
  Project,
  ProjectRepositoryInterface,
  Vintage,
} from '../../domain/portfolio';
import { PrismaService } from '../prisma.service';
import {
  Project as ProjectModel,
  Vintage as VintageModel,
} from '@prisma/client';

export class PrismaProjectRepository implements ProjectRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}
  async findOneByIdentifier(identifier: string): Promise<Project> {
    return this.prismaToProject(
      await this.prisma.project.findFirst({
        where: { OR: [{ id: identifier }, { name: identifier }] },
        include: { vintages: true },
      }),
    );
  }
  async findProjectsCcs(ids: string[]): Promise<Map<string, Vintage[]>> {
    const vintage = await this.prisma.vintage.findMany({
      where: { projectId: { in: ids } },
      orderBy: { year: 'asc' },
    });
    const vintageMap = new Map();
    for (const item of vintage) {
      const vintageList = vintageMap.get(item.year) || [];
      vintageList.push(vintage);
      vintageMap.set(item.year, vintageList);
    }

    return vintageMap;
  }
  async lockReservedCcs(id: string, count: number): Promise<void> {
    await this.prisma.vintage.update({
      where: { id },
      data: {
        reserved: {
          decrement: count,
        },
      },
    });
  }
  async findByIds(ids: string[]): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { id: { in: ids } },
      include: { vintages: true },
    });
    return projects.map(this.prismaToProject.bind(this));
  }

  async byAllocationIds(ids: string[]): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { allocations: { some: { id: { in: ids } } } },
      include: { vintages: true },
    });
    return projects.map(this.prismaToProject.bind(this));
  }

  prismaToProject(project: ProjectModel): Project {
    return new Project(
      project.id,
      project.name,
      project.description,
      [],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      project.vintages.map((v: VintageModel) => {
        const vintage = new Vintage(
          v.id,
          v.year,
          v.capacity,
          v.purchased,
          v.purchased_price,
          v.issued_price,
        );
        vintage.lock(v.reserved);
        return vintage;
      }) ?? [],
    );
  }
}
