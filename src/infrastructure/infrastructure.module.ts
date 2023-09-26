import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateBusinessUnitController } from './controller';
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
import { CreateForecastedTargetsController } from './controller/create-forecasted-targets';
import { PrismaOrderBookRepository } from './repository/order-book.prisma';
import { CreateForecastedEmissionsController } from './controller/create-forecasted-emissions';

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
          new PrismaOrderBookRepository(prisma),
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
      provide: ID_GENERATOR,
      useClass: UlidIdGenerator,
    },
  ],
  exports: [PrismaService],
  controllers: [
    CreateBusinessUnitController,
    CreateForecastedTargetsController,
    CreateForecastedEmissionsController,
  ],
})
export class InfrastructureModule {}
