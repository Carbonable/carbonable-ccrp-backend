import { Inject, Logger } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Public } from '../../auth/auth.public.decorator';
import {
  CreateBusinessUnitRequest,
  CreateBusinessUnitResponse,
  CreateBusinessUnitUseCase,
} from '../../domain/business-unit';
import { ID_GENERATOR, IdGeneratorInterface } from '../../domain/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { prismaToBusinessUnit } from '../../infrastructure/repository/business-unit.prisma';
import Utils from '../../utils';
import { ORDER_BOOK_REPOSITORY } from '../../infrastructure/repository/order-book.prisma';
import { OrderBookRepositoryInterface } from '../../domain/order-book';

@Resolver('BusinessUnit')
export class BusinessUnitResolver {
  private readonly logger = new Logger(BusinessUnitResolver.name);
  constructor(
    private readonly createBusinessUnitUseCase: CreateBusinessUnitUseCase,
    @Inject(ID_GENERATOR) private readonly idGenerator: IdGeneratorInterface,
    private readonly prisma: PrismaService,
    @Inject(ORDER_BOOK_REPOSITORY)
    private readonly orderBookRepository: OrderBookRepositoryInterface,
  ) {}

  @Public()
  @Mutation()
  async createBusinessUnit(
    @Args('request') requestInput: any,
  ): Promise<CreateBusinessUnitResponse> {
    this.logger.debug(
      `Creating business unit with payload ${JSON.stringify(requestInput)}`,
    );

    const request = new CreateBusinessUnitRequest({
      id: this.idGenerator.generate(),
      name: requestInput.name,
      description: requestInput.description,
      forecast_emission: requestInput.default_forecasted_emission,
      target: requestInput.default_target,
      debt: requestInput.debt,
      metadata: requestInput.metadata,
      company_id: requestInput.company_id,
    });

    return await this.createBusinessUnitUseCase.execute(request);
  }

  @Public()
  @Query('businessUnits')
  async getBusinessUnits() {
    const now = new Date().getFullYear();
    const bu = await this.prisma.businessUnit.findMany({
      include: {
        forecastTargets: true,
        forecastEmissions: true,
        allocations: true,
      },
    });

    const businessUnits = prismaToBusinessUnit(bu);
    return businessUnits.map(async (bu) => {
      const compensation =
        await this.orderBookRepository.getBusinessUnitYearlyEffectiveCompensation(
          bu.id,
        );
      const contribution =
        await this.orderBookRepository.getBusinessUnitYearlyEffectiveContribution(
          bu.id,
        );

      const compensationPercentage =
        (compensation
          .filter((c) => c.vintage === now.toString())
          .reduce((acc, curr) => acc + curr.compensation, 0) /
          bu.getYearlyEmission(now)) *
        100;
      return {
        ...bu,
        default_emission: bu.defaultEmission,
        default_target: bu.defaultTarget,
        allocations: bu.allocations.map((a) => ({
          project: a.projectId,
          amount: a.amount,
        })),
        actual_rate: Utils.formatString({
          value: Utils.round(compensationPercentage).toString(),
          suffix: '%',
        }),
        yearly_emissions: Utils.formatString({
          value: bu.getYearlyEmission(now).toString(),
          suffix: 't',
        }),
        yearly_contributions: Utils.formatString({
          value: contribution
            .filter((c) => c.vintage === now.toString())
            .reduce((acc, curr) => acc + curr.contribution, 0)
            .toString(),
          suffix: '$',
        }),
      };
    });
  }

  @Public()
  @Query('businessUnitsBy')
  async projectsBy(@Args('field') field: string, @Args('value') value: string) {
    const bu = await this.prisma.businessUnit.findFirst({
      where: { [field]: value },
      include: { forecastEmissions: true, forecastTargets: true },
    });
    return prismaToBusinessUnit([bu]).pop();
  }

  @Public()
  @Query('businessUnitDetails')
  async businessUnitDetails(@Args('id') id: string) {
    const now = new Date().getFullYear();
    const bu = await this.prisma.businessUnit.findFirst({
      where: { id },
      include: { forecastEmissions: true, forecastTargets: true },
    });
    if (!bu) {
      return null;
    }
    const businessUnit = prismaToBusinessUnit([bu]).pop();

    const allocations = await this.prisma.allocation.findMany({
      where: { businessUnitId: id },
      include: {
        project: true,
      },
    });
    // tons of cc for current year
    const compensation =
      await this.orderBookRepository.getBusinessUnitYearlyEffectiveCompensation(
        id,
      );
    const contribution =
      await this.orderBookRepository.getBusinessUnitYearlyEffectiveContribution(
        id,
      );

    const compensationPercentage =
      (compensation
        .filter((c) => c.vintage === now.toString())
        .reduce((acc, curr) => acc + curr.compensation, 0) /
        businessUnit.getYearlyEmission(now)) *
      100;

    return {
      ...businessUnit,
      default_emission: businessUnit.defaultEmission,
      default_target: businessUnit.defaultTarget,
      allocations: allocations.map((a) => ({
        project: a.project.name,
        amount: a.quantity,
      })),
      actual_rate: Utils.formatString({
        value: Utils.round(compensationPercentage).toString(),
        suffix: '%',
      }),
      yearly_emissions: Utils.formatString({
        value: businessUnit.getYearlyEmission(now).toString(),
        suffix: 't',
      }),
      yearly_contributions: Utils.formatString({
        value: contribution
          .filter((c) => c.vintage === now.toString())
          .reduce((acc, curr) => acc + curr.contribution, 0)
          .toString(),
        suffix: '$',
      }),
    };
  }
}
