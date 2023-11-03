import {
  AddAllocationRequest,
  AddAllocationResponse,
  Allocation,
  AllocationRepositoryInterface,
} from '.';
import { UseCaseInterface } from '../usecase.interface';
import { ProjectRepositoryInterface } from '../portfolio';
import { BusinessUnitRepositoryInterface } from '../business-unit';
import { IdGeneratorInterface } from '../common';
import { Booker, StockManager } from '../order-book';

const PROJECT_IDENTIFIER_REQUIRED = 'You have to provide a project identifier.';
const PROJECT_NOT_FOUND = 'Project not found.';
const ORDER_BOOKING_ERRORS = 'Error while booking orders';
const STOCK_CREATION_ERROR = 'Error while creating stock for allocation';

export class AddAllocationUseCase
  implements UseCaseInterface<AddAllocationRequest, AddAllocationResponse>
{
  constructor(
    private readonly projectRepository: ProjectRepositoryInterface,
    private readonly businesUnitRepository: BusinessUnitRepositoryInterface,
    private readonly allocationRepository: AllocationRepositoryInterface,
    private readonly booker: Booker,
    private readonly stockManager: StockManager,
    private readonly idGenerator: IdGeneratorInterface,
  ) {}

  async execute(request: AddAllocationRequest): Promise<AddAllocationResponse> {
    let errors = [];
    let allocations = [];
    for (const allocationRequest of request.allocations) {
      if (
        !allocationRequest.hasOwnProperty('projectId') &&
        !allocationRequest.hasOwnProperty('projectName')
      ) {
        errors = [...errors, PROJECT_IDENTIFIER_REQUIRED];
      }

      const identifier =
        allocationRequest.projectId ?? allocationRequest.projectName;

      try {
        const project = await this.projectRepository.findOneByIdentifier(
          identifier,
        );
        const businessUnit = await this.businesUnitRepository.byId(
          allocationRequest.businessUnitId,
        );

        // check if project is accessible to business unit making request

        // create allocation for project and business unit
        const allocation = new Allocation(
          this.idGenerator.generate(),
          project.id,
          businessUnit.id,
          allocationRequest.amount,
        );
        await this.allocationRepository.save(allocation);
        allocations = [...allocations, allocation];

        // Stock management
        try {
          await this.stockManager.createStockFor(
            allocation,
            project,
            businessUnit,
          );
        } catch (error) {
          errors = [...errors, STOCK_CREATION_ERROR + ': ' + error];
        }
      } catch (error) {
        // Project not found
        errors = [...errors, PROJECT_NOT_FOUND + ': ' + error];
      }
    }

    if (allocations.length !== request.allocations.length) {
      errors = [
        ...errors,
        `${
          request.allocations.length - allocations.length
        } has not been allocated. Please check error logs for more informations.`,
      ];
    }

    // Order placing
    try {
      await this.booker.placeOrders(allocations.map((a) => a.id));
    } catch (bookError) {
      errors = [...errors, ORDER_BOOKING_ERRORS + ': ' + bookError];
    }

    return new AddAllocationResponse(
      allocations.map((a) => a.id),
      errors,
    );
  }
}
