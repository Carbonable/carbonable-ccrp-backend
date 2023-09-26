import { monotonicFactory } from 'ulid';
const ulid = monotonicFactory();

export const ID_GENERATOR = 'ID_GENERATOR';

export class UlidIdGenerator implements IdGeneratorInterface {
  generate(): string {
    return ulid();
  }
}

export interface IdGeneratorInterface {
  generate(): string;
}
