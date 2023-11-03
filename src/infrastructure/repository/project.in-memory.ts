import {
  Project,
  ProjectRepositoryInterface,
  Vintage,
} from '../../domain/portfolio';

export class InMemoryProjectRepository implements ProjectRepositoryInterface {
  constructor(private projects: Array<Project> = []) {}

  async findOneByIdentifier(identifier: string): Promise<Project> {
    const project = this.projects.find(
      (project) => project.id === identifier || project.name === identifier,
    );
    if (null === project) {
      throw new Error('failed to find project with identifier : ' + identifier);
    }
    return project;
  }

  async findProjectsCcs(ids: string[]): Promise<Map<string, Vintage[]>> {
    const vintages = new Map<string, Vintage[]>();
    for (const project of this.projects) {
      if (!ids.includes(project.id)) {
        continue;
      }
      for (const vintage of project.vintages) {
        const vintageList = vintages.get(vintage.year) || [];
        vintageList.push(vintage);
        vintages.set(vintage.year, vintageList);
      }
    }
    return vintages;
  }

  async lockReservedCcs(id: string, count: number): Promise<void> {
    for (const project of this.projects) {
      for (const vintage of project.vintages) {
        if (id.includes(vintage.id)) {
          continue;
        }
        vintage.lock(count);
      }
    }
  }

  async addProject(project: Project): Promise<void> {
    this.projects.push(project);
  }
}
