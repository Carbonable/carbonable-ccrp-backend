import { Logger } from '@nestjs/common';
import { EventHandlerInterface } from '../common/event-dispatcher';
import { AllocationFinished } from './allocation.events';
import { AllocationRepositoryInterface } from './allocation-repository.interface';
import { VisualizationManager } from './visualization-manager';

export class AllocationFinishedHandler
  implements EventHandlerInterface<AllocationFinished>
{
  private readonly logger = new Logger(AllocationFinishedHandler.name);

  constructor(
    private readonly repository: AllocationRepositoryInterface,
    private readonly visualizationManager: VisualizationManager,
  ) {}

  async handle(event: AllocationFinished): Promise<void> {
    // remove allocations not in event.allocationIds
    try {
      await this.repository.flushAllocationsExcept(event.ids);
    } catch (e) {
      this.logger.error('Failed to flush old allocations');
      this.logger.error(e);
    }

    // remove visualization tables for previous allocations
    await this.visualizationManager.flushExcept(event.ids);

    // hydrate visualization tables
    // - net zero planning
    // - annual
    // - cumulative
    // - financial analysis
    await this.visualizationManager.hydrateVisualization(event.ids);
  }
}
