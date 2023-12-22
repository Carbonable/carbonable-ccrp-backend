import { Inject, Logger } from '@nestjs/common';
import { CommandRunner, Command } from 'nest-commander';
import { REDIS_CLIENT } from '../infrastructure/infrastructure.module';
import { RedisClientType } from 'redis';

@Command({ name: 'flush-redis' })
export class FlushRedisCommand extends CommandRunner {
  private readonly logger = new Logger(FlushRedisCommand.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {
    super();
  }

  async run(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    passedParams: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.redisClient.flushAll();

      this.logger.log('Redis flushed successfully');
    } catch (e) {
      this.logger.error(e);
    } finally {
      process.exit(0);
    }
  }
}
