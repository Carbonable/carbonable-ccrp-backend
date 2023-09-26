import { Inject } from '@nestjs/common';
import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
  CompanyRepositoryInterface,
} from '.';
import { UseCaseInterface } from '../usecase.interface';
import { CreateBusinessUnitRequest } from './create-business-unit.request';
import { CreateBusinessUnitResponse } from './create-business-unit.response';
import { BUSINESS_UNIT_REPOSITORY } from '../../infrastructure/repository/business-unit.prisma';
import { COMPANY_REPOSITORY } from '../../infrastructure/repository/company.prisma';

export class CreateBusinessUnitUseCase
  implements
    UseCaseInterface<CreateBusinessUnitRequest, CreateBusinessUnitResponse>
{
  constructor(
    @Inject(BUSINESS_UNIT_REPOSITORY)
    private readonly repository: BusinessUnitRepositoryInterface,
    @Inject(COMPANY_REPOSITORY)
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
