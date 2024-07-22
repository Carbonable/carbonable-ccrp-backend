export enum CsvRecordType {
  Company = 'Company',
  BusinessUnit = 'BusinessUnit',
  Allocation = 'Allocation',
  // Add other types as needed
}

// src/csv/csv-records.types.ts
export interface CompanyCsvRecord {
  companyName: string;
  businessUnitName: string;
  // Add other fields as necessary
}

export interface BusinessUnitCsvRecord {
  name: string;
  companyId: string;
  // Add other fields as necessary
}

export interface AllocationCsvRecord {
  project_id?: string;
  project_name?: string;
  business_unit_id: string;
  amount: number;
}

export type CsvRecord =
  | CompanyCsvRecord
  | BusinessUnitCsvRecord
  | AllocationCsvRecord;

// Create a type mapping based on the enum
export const CsvRecordTypeMap = {
  [CsvRecordType.Company]: {} as CompanyCsvRecord,
  [CsvRecordType.BusinessUnit]: {} as BusinessUnitCsvRecord,
  [CsvRecordType.Allocation]: {} as AllocationCsvRecord,
  // Add other mappings as necessary
};
