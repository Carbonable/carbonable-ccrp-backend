import { Config } from 'jest';
import BaseConfig from './jest.config';

export default async (): Promise<Config> => {
  const baseConfig = await BaseConfig();
  return {
    ...baseConfig,
    testRegex: 'integration\\.ts',
    forceExit: true,
  };
};
