import { VisualizationRepositoryInterface } from '../../domain/allocation';

export class InMemoryVisualizationRepository
  implements VisualizationRepositoryInterface
{
  constructor(
    private readonly cache: Map<string, string> = new Map<string, string>(),
  ) {}

  async get(key: string): Promise<string> {
    return this.cache.get(key) || null;
  }

  async put(key: string, value: string): Promise<void> {
    this.cache.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
