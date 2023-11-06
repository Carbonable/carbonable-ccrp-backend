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

  it('should ban keys and values with hyphens', () => {
    const input = 'an-invalid-key-value';
    try {
      MetadataParser.parse(input);
    } catch (err: any) {
      expect(err.message).toBe(
        'Metadata can only contains 1 hyphen by key/value. Consider replacing them with "_" with input : "an-invalid-key-value"',
      );
    }
  });
});
