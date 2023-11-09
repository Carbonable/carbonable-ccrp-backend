export const VISUALIZATION_REPOSITORY = 'VISUALIZATION_REPOSITORY';
export interface VisualizationRepositoryInterface {
  get(key: string): Promise<string>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}
