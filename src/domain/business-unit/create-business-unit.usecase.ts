import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
  CompanyRepositoryInterface,
} from '.';
import { UseCaseInterface } from '../usecase.interface';
import { CreateBusinessUnitRequest } from './create-business-unit.request';
import { CreateBusinessUnitResponse } from './create-business-unit.response';

export class CreateBusinessUnitUseCase
  implements
    UseCaseInterface<CreateBusinessUnitRequest, CreateBusinessUnitResponse>
{
  constructor(
    private readonly repository: BusinessUnitRepositoryInterface,
    private readonly companyRepository: CompanyRepositoryInterface,
  ) {}

  async execute(
    request: CreateBusinessUnitRequest,
  ): Promise<CreateBusinessUnitResponse> {
    const businessUnit = BusinessUnit.fromRequest(request);

    await this.repository.save(businessUnit);
    const company = await this.companyRepository.byId(request.companyId);
    company.addBusinessUnit(businessUnit);

    await this.companyRepository.save(company);

    return new CreateBusinessUnitResponse(businessUnit.id);
  }
}
