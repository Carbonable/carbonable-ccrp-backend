import { DefineStepFunction } from 'jest-cucumber';
import {
  Company,
  CompanyRepositoryInterface,
  CreateBusinessUnitRequest,
  CreateBusinessUnitUseCase,
  CreateForecastedEmissionsRequest,
  CreateForecastedEmissionsUseCase,
  CreateForecastedTargetsRequest,
  CreateForecastedTargetsUseCase,
  ForecastTarget,
  ForecastEmission,
} from '../../domain/business-unit';
import { UseCaseInterface } from '../../domain/usecase.interface';
import { Project, Vintage } from '../../domain/portfolio';
import { InMemoryProjectRepository } from '../../infrastructure/repository/project.in-memory';
import { IdGeneratorInterface } from '../../domain/common';

export const givenIHaveAnExistingCompany = (
  given: DefineStepFunction,
  companyId: string,
  company: Company,
  companyRepository: CompanyRepositoryInterface,
) => {
  given(/^I have an existing company "(.*)"$/, async (companyName: string) => {
    company = new Company(companyId, companyName);
    await companyRepository.save(company);
  });
};

export const andProjectIsConfigured = async (
  and: DefineStepFunction,
  projectRepository: InMemoryProjectRepository,
  idGenerator: IdGeneratorInterface,
) => {
  and(
    /^company "(.*)" has a project "(.*)" called "(.*)" described as "(.*)" with this absorption curve:$/,
    async (
      companyName: string,
      projectId: string,
      projectName: string,
      description: string,
      absorptionCurve: { timestamp: number; absorption: number }[],
    ) => {
      const vintages = await Vintage.buildFromAbsorptionCurve(
        idGenerator,
        absorptionCurve,
      );
      const project = new Project(
        projectId,
        projectName,
        description,
        [],
        vintages,
      );
      await projectRepository.addProject(project);
    },
  );
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
        forecast_emission: parseInt(forecastEmission),
        target: parseInt(target),
        debt: parseInt(debt),
        metadata,
        company_id: companyId,
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

export const andEmissionsForBusinessUnit = async (
  and: DefineStepFunction,
  createForecastedEmissionsUseCase: CreateForecastedEmissionsUseCase,
) => {
  and(
    /^the business unit with id "(.*)" have the following emissions:$/,
    async (businessUnitId: string, table) => {
      const request = new CreateForecastedEmissionsRequest(
        businessUnitId,
        table.map((i) => new ForecastEmission(i.year, i.quantity)),
      );
      await createForecastedEmissionsUseCase.execute(request);
    },
  );
};

export const andTargetsForBusinessUnit = async (
  and: DefineStepFunction,
  createForecastedTargetsUseCase: CreateForecastedTargetsUseCase,
) => {
  and(
    /^the business unit with id "(.*)" have the following targets:$/,
    async (businessUnitId: string, table) => {
      const request = new CreateForecastedTargetsRequest(
        businessUnitId,
        table.map((i) => new ForecastTarget(i.year, i.quantity)),
      );
      await createForecastedTargetsUseCase.execute(request);
    },
  );
};
