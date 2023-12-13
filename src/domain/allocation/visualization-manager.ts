import { Logger } from '@nestjs/common';
import { VisualizationStrategyInterface } from './visualization/visualization-strategy.interface';

export class VisualizationManager {
  private readonly logger = new Logger(VisualizationManager.name);

  constructor(private strategies: VisualizationStrategyInterface[]) {}

  async flushExcept(ids: string[]): Promise<void> {
    await Promise.all(this.strategies.map((s) => s.clean(ids)));
  }

  async hydrateVisualization(ids: string[]): Promise<void> {
    await Promise.all(this.strategies.map((s) => s.hydrate(ids)));
  }
}
