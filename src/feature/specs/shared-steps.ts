import { DefineStepFunction } from 'jest-cucumber';
import {
  Company,
  CompanyRepositoryInterface,
  CreateBusinessUnitRequest,
  CreateBusinessUnitUseCase,
} from '../../domain/business-unit';
import { UseCaseInterface } from '../../domain/usecase.interface';

export const givenIHaveAnExistingCompany = (
  given: DefineStepFunction,
  companyId: string,
  company: Company,
  companyRepository: CompanyRepositoryInterface,
) => {
  given(/^I have an existing company "(.*)"$/, (companyName: string) => {
    company = new Company(companyId, companyName);
    companyRepository.save(company);
  });
};

export const andTheFollowingBusinessUnit = async (
  and: DefineStepFunction,
  companyId: string,
  createBusinessUseCase: CreateBusinessUnitUseCase,
  callback: (id: string) => void,
) => {
  let bId: string;
  and('the following business unit:', async (table) => {
    const { id, name, description, forecastEmission, target, debt, metadata } =
      table.shift();
    const response = await createBusinessUseCase.execute(
      new CreateBusinessUnitRequest({
        id,
        name,
        description,
        forecastEmission: parseInt(forecastEmission),
        target: parseInt(target),
        debt: parseInt(debt),
        metadata,
        companyId,
      }),
    );
    bId = response.id;
    callback(bId);
  });
};

export function andIExecuteTheRequest<
  UseCase extends UseCaseInterface<Request, Response>,
  Request,
  Response,
>(
  and: DefineStepFunction,
  useCase: UseCase,
  request: () => Request,
  setResponseCallback: (response: Response) => void,
) {
  and('I submit the request', async () => {
    setResponseCallback(await useCase.execute(request()));
  });
}
