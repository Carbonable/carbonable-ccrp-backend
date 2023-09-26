import { UseCaseInterface } from '../usecase.interface';
import {
  BusinessUnitRepositoryInterface,
  CreateForecastedEmissionsRequest,
  CreateForecastedEmissionsResponse,
} from '.';
import { IdGeneratorInterface, UlidIdGenerator } from '../common';

export class CreateForecastedEmissionsUseCase
  implements
    UseCaseInterface<
      CreateForecastedEmissionsRequest,
      CreateForecastedEmissionsResponse
    >
{
  constructor(
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    private readonly idGenerator: IdGeneratorInterface = new UlidIdGenerator(),
  ) {}

  async execute(
    request: CreateForecastedEmissionsRequest,
  ): Promise<CreateForecastedEmissionsResponse> {
    const businessUnit = await this.businessUnitRepository.byId(
      request.businessUnitId,
    );

    const emissions = request.forecastEmissions.map((fe) => ({
      ...fe,
      id: this.idGenerator.generate(),
      businessUnitId: businessUnit.id,
    }));
    businessUnit.addForecastEmissions(emissions);

    await this.businessUnitRepository.save(businessUnit);

    return new CreateForecastedEmissionsResponse(businessUnit.id);
  }
}
