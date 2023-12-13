import {
  Allocation,
  AllocationRepositoryInterface,
} from '../../domain/allocation';
import { PrismaService } from '../prisma.service';
import { Allocation as AllocationModel } from '@prisma/client';

export class PrismaAllocationRepository
  implements AllocationRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async findByIds(ids: string[]): Promise<Allocation[]> {
    return this.prismaToAllocation(
      await this.prisma.allocation.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      }),
    );
  }
  async save(a: Allocation): Promise<void> {
    await this.prisma.allocation.create({
      data: {
        id: a.id,
        quantity: a.amount,
        businessUnitId: a.businessUnitId,
        projectId: a.projectId,
        allocatedAt: a.allocatedAt,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async flushAllocationsExcept(ids: string[]): Promise<void> {
    // TODO: Proper allocation deletion -> stock + orders
    // await this.prisma.allocation.deleteMany({
    //   where: {
    //     NOT: { id: { in: ids } },
    //   },
    // });
  }

  prismaToAllocation(allocation: AllocationModel[]): Allocation[] {
    return allocation.map(
      (a) =>
        new Allocation(
          a.id,
          a.projectId,
          a.businessUnitId,
          a.quantity,
          a.allocatedAt,
        ),
    );
  }
}
