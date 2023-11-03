import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  CreateBusinessUnitUseCase,
  CreateForecastedEmissionsUseCase,
  CreateForecastedTargetsUseCase,
} from '../domain/business-unit';
import {
  UlidIdGenerator,
  ID_GENERATOR,
  IdGeneratorInterface,
} from '../domain/common';
import { PrismaBusinessUnitRepository } from './repository/business-unit.prisma';
import { PrismaCompanyRepository } from './repository/company.prisma';
import { PrismaOrderBookRepository } from './repository/order-book.prisma';
import { AddAllocationUseCase } from '../domain/allocation';
import { PrismaProjectRepository } from './repository/project.prisma';
import { Booker, StockManager } from '../domain/order-book';
import { PrismaStockRepository } from './repository/stock.prisma';
import { PrismaAllocationRepository } from './repository/allocation.prisma';

@Module({
  providers: [
    PrismaService,
    {
      provide: CreateBusinessUnitUseCase,
      useFactory: (prisma: PrismaService) => {
        return new CreateBusinessUnitUseCase(
          new PrismaBusinessUnitRepository(prisma),
          new PrismaCompanyRepository(prisma),
        );
      },
      inject: [PrismaService],
    },
    {
      provide: CreateForecastedTargetsUseCase,
      useFactory: (
        prisma: PrismaService,
        idGenerator: IdGeneratorInterface,
      ) => {
        return new CreateForecastedTargetsUseCase(
          new PrismaBusinessUnitRepository(prisma),
          idGenerator,
        );
      },
      inject: [PrismaService, ID_GENERATOR],
    },
    {
      provide: CreateForecastedEmissionsUseCase,
      useFactory: (
        prisma: PrismaService,
        idGenerator: IdGeneratorInterface,
      ) => {
        return new CreateForecastedEmissionsUseCase(
          new PrismaBusinessUnitRepository(prisma),
          idGenerator,
        );
      },
      inject: [PrismaService, ID_GENERATOR],
    },
    {
      provide: AddAllocationUseCase,
      useFactory: (
        prisma: PrismaService,
        idGenerator: IdGeneratorInterface,
        booker: Booker,
        stockManager: StockManager,
      ) => {
        return new AddAllocationUseCase(
          new PrismaProjectRepository(prisma),
          new PrismaBusinessUnitRepository(prisma),
          new PrismaAllocationRepository(prisma),
          booker,
          stockManager,
          idGenerator,
        );
      },
      inject: [PrismaService, ID_GENERATOR, Booker, StockManager],
    },
    {
      provide: Booker,
      useFactory: (
        prisma: PrismaService,
        idGenerator: IdGeneratorInterface,
      ) => {
        return new Booker(
          new PrismaOrderBookRepository(prisma),
          new PrismaAllocationRepository(prisma),
          new PrismaProjectRepository(prisma),
          new PrismaBusinessUnitRepository(prisma),
          new PrismaStockRepository(prisma),
          idGenerator,
        );
      },
      inject: [PrismaService, ID_GENERATOR],
    },
    {
      provide: StockManager,
      useFactory: (
        prisma: PrismaService,
        idGenerator: IdGeneratorInterface,
      ) => {
        return new StockManager(new PrismaStockRepository(prisma), idGenerator);
      },
      inject: [PrismaService, ID_GENERATOR],
    },
    {
      provide: ID_GENERATOR,
      useClass: UlidIdGenerator,
    },
  ],
  exports: [
    PrismaService,
    CreateBusinessUnitUseCase,
    CreateForecastedTargetsUseCase,
    CreateForecastedEmissionsUseCase,
    AddAllocationUseCase,
    ID_GENERATOR,
  ],
})
export class InfrastructureModule {}
