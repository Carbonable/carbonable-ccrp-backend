import { RedisClientType } from 'redis';
import { VisualizationRepositoryInterface } from '../../domain/allocation';
import { REDIS_CLIENT } from '../infrastructure.module';
import { Inject } from '@nestjs/common';

export class RedisVisualizationRepository
  implements VisualizationRepositoryInterface
{
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClientType) {}

  async get(key: string): Promise<string> {
    return await this.client.get(key);
  }
  async put(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
