import BaseConfig from './jest.config';

export default async () => {
  const baseConfig = await BaseConfig();
  return {
    ...baseConfig,
    testRegex: 'integration\\.ts',
    detectOpenHandles: true,
  };
};
