import { UseCaseInterface } from '../usecase.interface';
import {
  BusinessUnitRepositoryInterface,
  CreateForecastedTargetsRequest,
  CreateForecastedTargetsResponse,
} from '.';
import { Order, OrderBookRepositoryInterface } from '../order-book';
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
    private readonly orderBookRepository: OrderBookRepositoryInterface,
    private readonly idGenerator: IdGeneratorInterface = new UlidIdGenerator(),
  ) {}
  async execute(
    request: CreateForecastedTargetsRequest,
  ): Promise<CreateForecastedTargetsResponse> {
    const businessUnit = await this.businessUnitRepository.byId(
      request.businessUnitId,
    );

    const targets = request.forecastTargets.map((ft) => ({
      ...ft,
      id: this.idGenerator.generate(),
      businessUnitId: businessUnit.id,
    }));
    businessUnit.addTargets(targets);
    await this.businessUnitRepository.save(businessUnit);

    const orders = Order.fromTargetsRequest(request, this.idGenerator.generate);
    await this.orderBookRepository.save(orders);

    return new CreateForecastedTargetsResponse(request.businessUnitId);
  }
}
