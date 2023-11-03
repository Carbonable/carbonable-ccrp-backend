import { Resolver, Mutation, Args } from '@nestjs/graphql';
import {
  CreateForecastedEmissionsRequest,
  CreateForecastedEmissionsResponse,
  CreateForecastedEmissionsUseCase,
  CreateForecastedTargetsRequest,
  CreateForecastedTargetsResponse,
  CreateForecastedTargetsUseCase,
  ForecastEmission,
  ForecastTarget,
} from '../../domain/business-unit';
import { Logger } from '@nestjs/common';

type ForecastedData = {
  year: string;
  quantity: number;
};
type CreateDemandInput = {
  business_unit_id: string;
  data: ForecastedData[];
};

@Resolver('Demand')
export class DemandResolver {
  private readonly logger = new Logger(DemandResolver.name);

  constructor(
    private readonly createEmissionsUseCase: CreateForecastedEmissionsUseCase,
    private readonly createTargetsUseCase: CreateForecastedTargetsUseCase,
  ) {}

  @Mutation('createForecastedEmissions')
  async createForecastedEmissions(
    @Args('request') input: CreateDemandInput,
  ): Promise<CreateForecastedEmissionsResponse> {
    this.logger.debug(`createForecastedEmissions: ${JSON.stringify(input)}`);
    const request = new CreateForecastedEmissionsRequest(
      input.business_unit_id,
      input.data.map(
        (item) => new ForecastEmission(parseInt(item.year), item.quantity),
      ),
    );

    return await this.createEmissionsUseCase.execute(request);
  }

  @Mutation('createForecastedTargets')
  async createForecastedTargets(
    @Args('request') requestInput: CreateDemandInput,
  ): Promise<CreateForecastedTargetsResponse> {
    this.logger.debug(
      `createForecastedTargets: ${JSON.stringify(requestInput)}`,
    );
    const request = new CreateForecastedTargetsRequest(
      requestInput.business_unit_id,
      requestInput.data.map(
        (item) => new ForecastTarget(parseInt(item.year), item.quantity),
      ),
    );

    return await this.createTargetsUseCase.execute(request);
  }
}
