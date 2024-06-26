import BaseConfig from './jest.config';

async () => {
  const baseConfig = await BaseConfig();
  return {
    ...baseConfig,
    testRegex: 'integration\\.ts',
    detectOpenHandles: true,
  };
};
