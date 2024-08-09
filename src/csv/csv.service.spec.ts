import { Test, TestingModule } from '@nestjs/testing';
import { CsvService } from './csv.service';
import * as fs from 'fs';
import * as path from 'path';

describe('CsvService Stress Test', () => {
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvService],
    }).compile();

    csvService = module.get<CsvService>(CsvService);
  });

  const createProject = (data: any) => ({
    id: csvService.nonNullString(data, 'id'),
    name: csvService.nonNullString(data, 'name'),
    slug: csvService.nonNullString(data, 'slug'),
    description: csvService.nonNullString(data, 'description'),
    localization: csvService.nonNullString(data, 'localization'),
    startDate: csvService.nonNullString(data, 'start_date'),
    endDate: csvService.nonNullString(data, 'end_date'),
    area: csvService.parseIntSafe(data.area),
    type: csvService.checkAndParseCarbonCreditType(data.type),
    origin: csvService.checkAndParseCarbonCreditOrigin(data.origin),
    fundingAmount: csvService.parseFloatSafe(data.funding_amount),
    color: csvService.checkAndParseProjectColor(data.color),
    protectedSpecies: csvService.parseIntSafe(data.protected_species),
    protectedForest: csvService.parseIntSafe(data.protected_forest),
    riskAnalysis: csvService.nonNullString(data, 'risk_analysis'),
    metadata: csvService.parseJSONSafe(data.metadata),
    certifierId: !data.certifier_id ? null : data.certifier_id,
    developperId: !data.developper_id ? null : data.developper_id,
    countryId: csvService.nonNullString(data, 'country_id'),
    companyId: csvService.nonNullString(data, 'company_id'),
  });

  const createAllocation = (data: any) => ({
    id: csvService.nonNullString(data, 'id'),
    quantity: csvService.parseIntSafe(data.quantity),
    allocatedAt: csvService.parseDateSafe(data.allocated_at),
    businessUnitId: csvService.nonNullString(data, 'business_unit_id'),
    projectId: csvService.nonNullString(data, 'project_id'),
  });

  it('should process a large good-format project CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../test/csv-test/good-format/project.csv',
    );
    const buffer = fs.readFileSync(csvFilePath);

    const result = await csvService.parseCSV(buffer, createProject);

    expect(result.length).toBeGreaterThan(0); // Assuming there are multiple records in the CSV
    expect(result[0]).toHaveProperty('id'); // Check that it correctly parsed the first record
  });

  it('should process a large good-format allocation CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../test/csv-test/good-format/allocations.csv',
    );
    const buffer = fs.readFileSync(csvFilePath);

    const result = await csvService.parseCSV(buffer, createAllocation);

    expect(result.length).toBeGreaterThan(0); // Assuming there are multiple records in the CSV
    expect(result[0]).toHaveProperty('id'); // Check that it correctly parsed the first record
  });
});
