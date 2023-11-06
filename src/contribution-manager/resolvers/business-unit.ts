import { Inject, Logger } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  CreateBusinessRequestInput,
  CreateBusinessUnitRequest,
  CreateBusinessUnitResponse,
  CreateBusinessUnitUseCase,
} from '../../domain/business-unit';
import { ID_GENERATOR, IdGeneratorInterface } from '../../domain/common';

@Resolver('BusinessUnit')
export class BusinessUnitResolver {
  private readonly logger = new Logger(BusinessUnitResolver.name);
  constructor(
    private readonly createBusinessUnitUseCase: CreateBusinessUnitUseCase,
    @Inject(ID_GENERATOR) private readonly idGenerator: IdGeneratorInterface,
  ) {}

  @Mutation()
  async createBusinessUnit(
    @Args('request') requestInput: CreateBusinessRequestInput,
  ): Promise<CreateBusinessUnitResponse> {
    this.logger.debug(
      `Creating business unit with payload ${JSON.stringify(requestInput)}`,
    );

    const request = new CreateBusinessUnitRequest({
      id: this.idGenerator.generate(),
      name: requestInput.name,
      description: requestInput.description,
      forecast_emission: requestInput.forecast_emission,
      target: requestInput.target,
      debt: requestInput.debt,
      metadata: requestInput.metadata,
      company_id: requestInput.company_id,
    });

    return await this.createBusinessUnitUseCase.execute(request);
  }
}
