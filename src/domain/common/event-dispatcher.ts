export interface EventDispatcherInterface {
  dispatch<T>(eventName: string, event: T): Promise<void>;
}

export interface EventHandlerInterface<T> {
  handle(event: T): Promise<void>;
}
