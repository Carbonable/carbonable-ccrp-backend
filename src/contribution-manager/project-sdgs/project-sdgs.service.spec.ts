import { Test, TestingModule } from '@nestjs/testing';
import { ProjectSdgsService } from './project-sdgs.service';
import { CsvService } from '../../csv/csv.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

describe('ProjectSdgsService - createProjectSdgs with CSV files', () => {
  let projectSdgsService: ProjectSdgsService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectSdgsService,
        CsvService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(), // Mock the PrismaService
          },
        },
      ],
    }).compile();

    projectSdgsService = module.get<ProjectSdgsService>(ProjectSdgsService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should correctly process a well-formatted CSV file', () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/good-format/projects-sdgs.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);
    const csvData = csvService.parseCSV(
      csvBuffer,
      projectSdgsService['createProjectSdgs'].bind(projectSdgsService),
    );

    csvData.then((result) => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('projectId');
      expect(result[0]).toHaveProperty('sdgId');
    });
  });

  it('should throw an error for a badly formatted CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/wrong-format/projects-sdgs.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);

    await expect(
      csvService.parseCSV(
        csvBuffer,
        projectSdgsService['createProjectSdgs'].bind(projectSdgsService),
      ),
    ).rejects.toThrowError('Invalid file format');
  });
});
