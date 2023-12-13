export interface VisualizationStrategyInterface {
  clean(allocationIds: string[]): Promise<void>;
  hydrate(allocationIds: string[]): Promise<void>;
}
