import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventDispatcherInterface } from '../domain/common';

export const NEST_EVENT_DISPATCHER = 'NEST_EVENT_DISPATCHER';
export class NestjsEventDispatcher implements EventDispatcherInterface {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async dispatch<T>(eventName: string, event: T): Promise<void> {
    this.eventEmitter.emit(eventName, event);
  }
}
