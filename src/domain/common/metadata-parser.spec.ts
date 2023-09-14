import { MetadataParser } from './metadata-parser';

describe('MetadataParser', () => {
  it('should parse metadata', () => {
    const input = 'key1-value1,key2-value2,key3-value3';
    const res = MetadataParser.parse(input);

    expect(res.length).toBe(3);
    expect(res).toEqual([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' },
      { key: 'key3', value: 'value3' },
    ]);
  });
});
