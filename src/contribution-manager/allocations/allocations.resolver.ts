import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  AddAllocationRequest,
  AddAllocationResponse,
  AddAllocationUseCase,
} from '../../domain/allocation';
import { Logger } from '@nestjs/common';
import { Public } from '../../auth/auth.public.decorator';
import { AddAllocationRequestItem } from './types';

@Resolver('Allocation')
export class AllocationResolver {
  private readonly logger = new Logger(AllocationResolver.name);
  constructor(private readonly addAllocationUseCase: AddAllocationUseCase) {}

  @Public()
  @Mutation('addAllocations')
  async addAllocations(
    @Args('request') requestInput: Array<AddAllocationRequestItem>,
  ): Promise<AddAllocationResponse> {
    this.logger.debug(
      `addAllocations with payload ${JSON.stringify(requestInput)}`,
    );
    const request = new AddAllocationRequest(
      requestInput.map((r) => ({
        projectId: r.project_id,
        businessUnitId: r.business_unit_id,
        amount: r.amount,
      })),
    );

    return await this.addAllocationUseCase.execute(request);
  }
}
