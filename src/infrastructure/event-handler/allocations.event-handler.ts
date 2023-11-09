import { Logger } from '@nestjs/common';
import {
  AllocationFinished,
  AllocationFinishedHandler,
} from '../../domain/allocation';

export class NestJsOnAllocationFinished {
  private readonly logger = new Logger(NestJsOnAllocationFinished.name);
  constructor(private readonly handler: AllocationFinishedHandler) {}

  async handleAllocationFinished(event: AllocationFinished): Promise<void> {
    this.logger.debug(`handleAllocationFinished -> ${JSON.stringify(event)}`);
    this.handler.handle(event);
  }
}
