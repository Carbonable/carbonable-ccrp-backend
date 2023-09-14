import { UseCaseInterface } from '../usecase.interface';
import {
  BusinessUnitRepositoryInterface,
  CreateForecastedEmissionsRequest,
  CreateForecastedEmissionsResponse,
} from '.';

export class CreateForecastedEmissionsUseCase
  implements
    UseCaseInterface<
      CreateForecastedEmissionsRequest,
      CreateForecastedEmissionsResponse
    >
{
  constructor(
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
  ) {}

  async execute(
    request: CreateForecastedEmissionsRequest,
  ): Promise<CreateForecastedEmissionsResponse> {
    const businessUnit = await this.businessUnitRepository.byId(
      request.businessUnitId,
    );

    businessUnit.addForecastEmissions(request.forecastEmissions);

    await this.businessUnitRepository.save(businessUnit);

    return new CreateForecastedEmissionsResponse(businessUnit.id);
  }
}
