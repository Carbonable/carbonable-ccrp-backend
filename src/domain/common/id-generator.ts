import { monotonicFactory } from 'ulid';
const ulid = monotonicFactory();

export class UlidIdGenerator implements IdGeneratorInterface {
  generate(): string {
    return ulid();
  }
}

export interface IdGeneratorInterface {
  generate(): string;
}
