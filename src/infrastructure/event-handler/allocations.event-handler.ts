import { Logger } from '@nestjs/common';
import {
  AllocationFinished,
  AllocationFinishedHandler,
} from '../../domain/allocation';
import { OnEvent } from '@nestjs/event-emitter';
import { ALLOCATION_FINISHED } from '../../domain/allocation/allocation.events';

export class NestJsOnAllocationFinished {
  private readonly logger = new Logger(NestJsOnAllocationFinished.name);
  constructor(private readonly handler: AllocationFinishedHandler) {}

  @OnEvent(ALLOCATION_FINISHED, { async: true })
  async handleAllocationFinished(event: AllocationFinished): Promise<void> {
    this.logger.debug(`handleAllocationFinished -> ${JSON.stringify(event)}`);
    await this.handler.handle(event);
  }
}
