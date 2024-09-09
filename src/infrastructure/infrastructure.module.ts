import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  BusinessUnitRepositoryInterface,
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
import {
  BUSINESS_UNIT_REPOSITORY,
  PrismaBusinessUnitRepository,
} from './repository/business-unit.prisma';
import { PrismaCompanyRepository } from './repository/company.prisma';
import {
  ORDER_BOOK_REPOSITORY,
  PrismaOrderBookRepository,
} from './repository/order-book.prisma';
import {
  AddAllocationUseCase,
  AllocationFinishedHandler,
  VISUALIZATION_REPOSITORY,
  VisualizationManager,
  VisualizationRepositoryInterface,
} from '../domain/allocation';
import { PrismaProjectRepository } from './repository/project.prisma';
import {
  Booker,
  OrderBookRepositoryInterface,
  StockManager,
  StockRepositoryInterface,
} from '../domain/order-book';
import {
  PrismaStockRepository,
  STOCK_REPOSITORY,
} from './repository/stock.prisma';
import { PrismaAllocationRepository } from './repository/allocation.prisma';
import {
  NEST_EVENT_DISPATCHER,
  NestjsEventDispatcher,
} from './event-dispatcher.nestjs';
import {
  NetZeroVisualizationStrategy,
  AnnualPlanningVisualizationStrategy,
  CumulativePlanningVisualizationStrategy,
} from '../domain/allocation/visualization';
import { FinancialAnalysisVisualizationStrategy } from '../domain/allocation/visualization/financial-analysis.strategy';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NestJsOnAllocationFinished } from './event-handler/allocations.event-handler';
import { VisualizationDataExtractor } from '../domain/allocation/visualization/visualization-data-extractor';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '../domain/portfolio/project-repository.interface';
import {
  COMPANY_REPOSITORY,
  CompanyRepositoryInterface,
} from '../domain/business-unit/company-repository.interface';

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
      provide: ORDER_BOOK_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        return new PrismaOrderBookRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: BUSINESS_UNIT_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        return new PrismaBusinessUnitRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: PROJECT_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        return new PrismaProjectRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: COMPANY_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        return new PrismaCompanyRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: STOCK_REPOSITORY,
      useFactory: (prisma: PrismaService) => {
        return new PrismaStockRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: NEST_EVENT_DISPATCHER,
      useFactory: (eventEmitter: EventEmitter2) => {
        return new NestjsEventDispatcher(eventEmitter);
      },
      inject: [EventEmitter2],
    },
    // {
    //   provide: AllocationFinishedHandler,
    //   useFactory: (
    //     prisma: PrismaService,
    //     visualizationManager: VisualizationManager,
    //   ) => {
    //     return new AllocationFinishedHandler(
    //       new PrismaAllocationRepository(prisma),
    //       visualizationManager,
    //     );
    //   },
    //   inject: [PrismaService, VisualizationManager],
    // },
    // {
    //   provide: NestJsOnAllocationFinished,
    //   useFactory: (handler: AllocationFinishedHandler) => {
    //     return new NestJsOnAllocationFinished(handler);
    //   },
    //   inject: [AllocationFinishedHandler],
    // },
    {
      provide: VisualizationDataExtractor,
      useFactory: (
        companyRepository: CompanyRepositoryInterface,
        businessUnitRepository: BusinessUnitRepositoryInterface,
        projectRepository: ProjectRepositoryInterface,
      ) => {
        return new VisualizationDataExtractor(
          companyRepository,
          businessUnitRepository,
          projectRepository,
        );
      },
      inject: [
        COMPANY_REPOSITORY,
        BUSINESS_UNIT_REPOSITORY,
        PROJECT_REPOSITORY,
      ],
    },
    // {
    //   provide: NetZeroVisualizationStrategy,
    //   useFactory: (
    //     visualizationDataExtractor: VisualizationDataExtractor,
    //     visualizationRepository: VisualizationRepositoryInterface,
    //     stockRepository: StockRepositoryInterface,
    //     orderRepository: OrderBookRepositoryInterface,
    //     businessUnitRepository: BusinessUnitRepositoryInterface,
    //   ) => {
    //     return new NetZeroVisualizationStrategy(
    //       visualizationDataExtractor,
    //       visualizationRepository,
    //       stockRepository,
    //       orderRepository,
    //       businessUnitRepository,
    //     );
    //   },
    //   inject: [
    //     VisualizationDataExtractor,
    //     VISUALIZATION_REPOSITORY,
    //     STOCK_REPOSITORY,
    //     ORDER_BOOK_REPOSITORY,
    //     BUSINESS_UNIT_REPOSITORY,
    //   ],
    // },
    // {
    //   provide: AnnualPlanningVisualizationStrategy,
    //   useFactory: (
    //     visualizationDataExtractor: VisualizationDataExtractor,
    //     visualizationRepository: VisualizationRepositoryInterface,
    //     stockRepository: StockRepositoryInterface,
    //     orderRepository: OrderBookRepositoryInterface,
    //     businessUnitRepository: BusinessUnitRepositoryInterface,
    //     companyRepository: CompanyRepositoryInterface,
    //   ) => {
    //     return new AnnualPlanningVisualizationStrategy(
    //       visualizationDataExtractor,
    //       visualizationRepository,
    //       stockRepository,
    //       orderRepository,
    //       businessUnitRepository,
    //       companyRepository,
    //     );
    //   },
    //   inject: [
    //     VisualizationDataExtractor,
    //     VISUALIZATION_REPOSITORY,
    //     STOCK_REPOSITORY,
    //     ORDER_BOOK_REPOSITORY,
    //     BUSINESS_UNIT_REPOSITORY,
    //     COMPANY_REPOSITORY,
    //   ],
    // },
    // {
    //   provide: CumulativePlanningVisualizationStrategy,
    //   useFactory: (
    //     visualizationDataExtractor: VisualizationDataExtractor,
    //     visualizationRepository: VisualizationRepositoryInterface,
    //     stockRepository: StockRepositoryInterface,
    //     orderRepository: OrderBookRepositoryInterface,
    //     businessUnitRepository: BusinessUnitRepositoryInterface,
    //     companyRepository: CompanyRepositoryInterface,
    //   ) => {
    //     return new CumulativePlanningVisualizationStrategy(
    //       visualizationDataExtractor,
    //       visualizationRepository,
    //       stockRepository,
    //       orderRepository,
    //       businessUnitRepository,
    //       companyRepository,
    //     );
    //   },
    //   inject: [
    //     VisualizationDataExtractor,
    //     VISUALIZATION_REPOSITORY,
    //     STOCK_REPOSITORY,
    //     ORDER_BOOK_REPOSITORY,
    //     BUSINESS_UNIT_REPOSITORY,
    //     COMPANY_REPOSITORY,
    //   ],
    // },
    // {
    //   provide: FinancialAnalysisVisualizationStrategy,
    //   useFactory: (
    //     visualizationDataExtractor: VisualizationDataExtractor,
    //     visualizationRepository: VisualizationRepositoryInterface,
    //     stockRepository: StockRepositoryInterface,
    //     businessUnitRepository: BusinessUnitRepositoryInterface,
    //     orderRepository: OrderBookRepositoryInterface,
    //     companyRepository: CompanyRepositoryInterface,
    //   ) => {
    //     return new FinancialAnalysisVisualizationStrategy(
    //       visualizationDataExtractor,
    //       visualizationRepository,
    //       stockRepository,
    //       businessUnitRepository,
    //       orderRepository,
    //       companyRepository,
    //     );
    //   },
    //   inject: [
    //     VisualizationDataExtractor,
    //     VISUALIZATION_REPOSITORY,
    //     STOCK_REPOSITORY,
    //     BUSINESS_UNIT_REPOSITORY,
    //     ORDER_BOOK_REPOSITORY,
    //     COMPANY_REPOSITORY,
    //   ],
    // },
    // {
    //   provide: VisualizationManager,
    //   useFactory: (
    //     netZeroVisualizationStrategy: NetZeroVisualizationStrategy,
    //     annualPlanningVisualizationStrategy: AnnualPlanningVisualizationStrategy,
    //     cumulativePlanningVisualizationStrategy: CumulativePlanningVisualizationStrategy,
    //     financialAnalysisVisualizationStrategy: FinancialAnalysisVisualizationStrategy,
    //   ) => {
    //     return new VisualizationManager([
    //       netZeroVisualizationStrategy,
    //       annualPlanningVisualizationStrategy,
    //       cumulativePlanningVisualizationStrategy,
    //       financialAnalysisVisualizationStrategy,
    //     ]);
    //   },
    //   inject: [
    //     NetZeroVisualizationStrategy,
    //     AnnualPlanningVisualizationStrategy,
    //     CumulativePlanningVisualizationStrategy,
    //     FinancialAnalysisVisualizationStrategy,
    //   ],
    // },
  ],
  exports: [
    PrismaService,
    CreateBusinessUnitUseCase,
    CreateForecastedTargetsUseCase,
    CreateForecastedEmissionsUseCase,
    AddAllocationUseCase,
    ID_GENERATOR,
    NEST_EVENT_DISPATCHER,
    // VisualizationManager,
    ORDER_BOOK_REPOSITORY,
    BUSINESS_UNIT_REPOSITORY,
    PROJECT_REPOSITORY,
    COMPANY_REPOSITORY,
    STOCK_REPOSITORY,
    // NetZeroVisualizationStrategy,
    // AnnualPlanningVisualizationStrategy,
    // CumulativePlanningVisualizationStrategy,
    // FinancialAnalysisVisualizationStrategy,
  ],
})
export class InfrastructureModule { }
