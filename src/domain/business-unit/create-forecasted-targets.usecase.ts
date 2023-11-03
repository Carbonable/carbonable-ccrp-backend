import { UseCaseInterface } from '../usecase.interface';
import {
  BusinessUnitRepositoryInterface,
  CreateForecastedTargetsRequest,
  CreateForecastedTargetsResponse,
} from '.';
import { IdGeneratorInterface, UlidIdGenerator } from '../common';

export class CreateForecastedTargetsUseCase
  implements
    UseCaseInterface<
      CreateForecastedTargetsRequest,
      CreateForecastedTargetsResponse
    >
{
  constructor(
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    private readonly idGenerator: IdGeneratorInterface = new UlidIdGenerator(),
  ) {}

  async execute(
    request: CreateForecastedTargetsRequest,
  ): Promise<CreateForecastedTargetsResponse> {
    const businessUnit = await this.businessUnitRepository.byId(
      request.businessUnitId,
    );
    if (null === businessUnit) {
      return new CreateForecastedTargetsResponse('', [
        'Business unit not found.',
      ]);
    }

    const targets = request.forecastTargets.map((ft) => ({
      ...ft,
      id: this.idGenerator.generate(),
      businessUnitId: businessUnit.id,
    }));
    businessUnit.addTargets(targets);
    await this.businessUnitRepository.save(businessUnit);

    return new CreateForecastedTargetsResponse(request.businessUnitId);
  }
}
