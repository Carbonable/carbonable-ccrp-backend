export type Metadata<K, V> = {
  key: K;
  value: V;
};

export class MetadataParser {
  static parse(metadataInput: string): Array<Metadata<string, string>> {
    return metadataInput.split(',').map((item) => {
      const parts = item.split('-');
      return {
        key: parts.shift(),
        value: parts.shift(),
      };
    });
  }
}
