export type Metadata<K, V> = {
  key: K;
  value: V;
};

export class MetadataParser {
  static parse(metadataInput: string): Array<Metadata<string, string>> {
    return metadataInput.split(',').map((item) => {
      const hyphensCount = (item.match(/-/g) || []).length;
      if (hyphensCount > 1) {
        throw new Error(
          `Metadata can only contains 1 hyphen by key/value. Consider replacing them with "_" with input : "${item}"`,
        );
      }
      const parts = item.split('-');
      return {
        key: parts.shift(),
        value: parts.shift(),
      };
    });
  }
}
