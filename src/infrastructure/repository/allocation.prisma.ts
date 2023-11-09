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
  async save(allocation: Allocation): Promise<void> {
    await this.prisma.allocation.create({
      data: {
        id: allocation.id,
        quantity: allocation.amount,
        businessUnitId: allocation.businessUnitId,
        projectId: allocation.projectId,
      },
    });
  }

  async flushAllocationsExcept(ids: string[]): Promise<void> {
    await this.prisma.allocation.deleteMany({
      where: {
        NOT: { id: { in: ids } },
      },
    });
  }

  prismaToAllocation(allocation: AllocationModel[]): Allocation[] {
    return allocation.map(
      (a) => new Allocation(a.id, a.projectId, a.businessUnitId, a.quantity),
    );
  }
}
