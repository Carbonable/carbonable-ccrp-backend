import { EventDispatcherInterface } from '../domain/common';

export class InMemoryEventDispatcher implements EventDispatcherInterface {
  constructor(public events: Map<string, any> = new Map()) {}
  async dispatch<T>(eventName: string, event: T): Promise<void> {
    const events = this.events.get(eventName) || [];
    events.push(event);
    this.events.set(eventName, events);
  }
}
