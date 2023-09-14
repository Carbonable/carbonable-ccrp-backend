import { MetadataParser } from '../common';
import { Metadata } from '../common/metadata-parser';

export type CreateBusinessRequestInput = {
  id: string;
  name: string;
  description: string;
  forecastEmission?: number;
  target?: number;
  debt?: number;
  metadata: string;
  companyId: string;
};

export class CreateBusinessUnitRequest {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly forecastEmission: number;
  public readonly target: number;
  public readonly debt: number;
  public readonly metadata: Array<Metadata<string, string>>;
  public readonly companyId: string;

  constructor(input: CreateBusinessRequestInput) {
    this.id = input.id;
    this.name = input.name;
    this.description = input.description;
    this.forecastEmission = input.forecastEmission ?? 0;
    this.target = input.target ?? 0;
    this.debt = input.debt ?? 0;
    this.metadata = MetadataParser.parse(input.metadata);
    this.companyId = input.companyId;
  }
}
