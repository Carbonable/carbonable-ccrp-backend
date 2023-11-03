import { Project, Vintage } from '.';

export interface ProjectRepositoryInterface {
  // In this case identifier can be any string identifier for the project : e.g name, id ...
  findOneByIdentifier(identifier: string): Promise<Project>;
  findProjectsCcs(ids: string[]): Promise<Map<string, Vintage[]>>;
  // Lock given amount of cc in project
  lockReservedCcs(id: string, count: number): Promise<void>;
}
