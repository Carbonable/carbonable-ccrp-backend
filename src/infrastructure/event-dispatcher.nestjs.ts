import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventDispatcherInterface } from '../domain/common';
import { Logger } from '@nestjs/common';

export const NEST_EVENT_DISPATCHER = 'NEST_EVENT_DISPATCHER';
export class NestjsEventDispatcher implements EventDispatcherInterface {
  private readonly logger = new Logger(NestjsEventDispatcher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async dispatch<T>(eventName: string, event: T): Promise<void> {
    this.logger.debug(
      `Dispatching event "${eventName}" with payload ${JSON.stringify(event)}`,
    );
    this.eventEmitter.emit(eventName, event);
  }
}
