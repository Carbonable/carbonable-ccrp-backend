import { Project, Vintage } from '.';

export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';
export interface ProjectRepositoryInterface {
  // In this case identifier can be any string identifier for the project : e.g name, id ...
  findOneByIdentifier(identifier: string): Promise<Project>;
  findProjectsCcs(ids: string[]): Promise<Map<string, Vintage[]>>;
  // Lock given amount of cc in project
  lockReservedCcs(id: string, count: number): Promise<void>;
  findByIds(ids: string[]): Promise<Project[]>;
  byAllocationIds(ids: string[]): Promise<Project[]>;
}
