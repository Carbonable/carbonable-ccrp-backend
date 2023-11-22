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
  EventDispatcherInterface,
} from '../domain/common';
import { PrismaBusinessUnitRepository } from './repository/business-unit.prisma';
import { PrismaCompanyRepository } from './repository/company.prisma';
import { PrismaOrderBookRepository } from './repository/order-book.prisma';
import {
  AddAllocationUseCase,
  VISUALIZATION_REPOSITORY,
  VisualizationManager,
  VisualizationRepositoryInterface,
} from '../domain/allocation';
import { PrismaProjectRepository } from './repository/project.prisma';
import { Booker, StockManager } from '../domain/order-book';
import { PrismaStockRepository } from './repository/stock.prisma';
import { PrismaAllocationRepository } from './repository/allocation.prisma';
import {
  NEST_EVENT_DISPATCHER,
  NestjsEventDispatcher,
} from './event-dispatcher.nestjs';
import { RedisClientType, createClient } from 'redis';
import { RedisVisualizationRepository } from './repository/visualization.redis';
import {
  NetZeroVisualizationStrategy,
  AnnualPlanningVisualizationStrategy,
  CumulativePlanningVisualizationStrategy,
} from '../domain/allocation/visualization';
import { FinancialAnalysisVisualizationStrategy } from '../domain/allocation/visualization/financial-analysis.strategy';

export const REDIS_CLIENT = 'REDIS_CLIENT';

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
        eventDispatcher: EventDispatcherInterface,
      ) => {
        return new AddAllocationUseCase(
          new PrismaProjectRepository(prisma),
          new PrismaBusinessUnitRepository(prisma),
          new PrismaAllocationRepository(prisma),
          booker,
          stockManager,
          idGenerator,
          eventDispatcher,
        );
      },
      inject: [
        PrismaService,
        ID_GENERATOR,
        Booker,
        StockManager,
        NEST_EVENT_DISPATCHER,
      ],
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
    {
      provide: NEST_EVENT_DISPATCHER,
      useClass: NestjsEventDispatcher,
    },
    {
      provide: REDIS_CLIENT,
      useFactory: async () => {
        const client = createClient({
          url: process.env.REDIS_URL ?? 'redis://localhost:6379',
        });
        await client.connect();
        return client;
      },
    },
    {
      provide: VISUALIZATION_REPOSITORY,
      useFactory: (client: RedisClientType) => {
        return new RedisVisualizationRepository(client);
      },
      inject: [REDIS_CLIENT],
    },
    {
      provide: VisualizationManager,
      useFactory: (
        prisma: PrismaService,
        visualizationRepository: VisualizationRepositoryInterface,
      ) => {
        const stockRepository = new PrismaStockRepository(prisma);
        const orderRepository = new PrismaOrderBookRepository(prisma);
        const businessUnitRepository = new PrismaBusinessUnitRepository(prisma);

        return new VisualizationManager(
          visualizationRepository,
          new PrismaAllocationRepository(prisma),
          businessUnitRepository,
          new PrismaCompanyRepository(prisma),
          [
            new NetZeroVisualizationStrategy(
              visualizationRepository,
              stockRepository,
              orderRepository,
              businessUnitRepository,
            ),
            new AnnualPlanningVisualizationStrategy(
              visualizationRepository,
              stockRepository,
              orderRepository,
              businessUnitRepository,
            ),
            new CumulativePlanningVisualizationStrategy(
              visualizationRepository,
              stockRepository,
              orderRepository,
              businessUnitRepository,
            ),
            new FinancialAnalysisVisualizationStrategy(
              visualizationRepository,
              stockRepository,
            ),
          ],
        );
      },
      inject: [PrismaService, VISUALIZATION_REPOSITORY],
    },
  ],
  exports: [
    PrismaService,
    CreateBusinessUnitUseCase,
    CreateForecastedTargetsUseCase,
    CreateForecastedEmissionsUseCase,
    AddAllocationUseCase,
    ID_GENERATOR,
    NEST_EVENT_DISPATCHER,
    REDIS_CLIENT,
    VisualizationManager,
    VISUALIZATION_REPOSITORY,
  ],
})
export class InfrastructureModule {}
