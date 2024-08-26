import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { CsvService } from '../../csv/csv.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { de } from '@faker-js/faker';

describe('ProjectService - createProject with CSV files', () => {
  let projectService: ProjectService;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        CsvService,
        {
          provide: PrismaService,
          useValue: {
            createManyOfType: jest.fn(), // Mock the PrismaService
          },
        },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should correctly process a well-formatted CSV file', () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/good-format/projects.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);
    const csvData = csvService.parseCSV(
      csvBuffer,
      projectService['createProject'].bind(projectService),
    );

    csvData.then((result) => {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('slug');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('startDate');
      expect(result[0]).toHaveProperty('companyId');
    });
  });

  it('should throw an error for a badly formatted CSV file', async () => {
    const csvFilePath = path.resolve(
      __dirname,
      '../../../test/csv-test/wrong-format/projects.csv',
    );
    const csvBuffer = fs.readFileSync(csvFilePath);

    await expect(
      csvService.parseCSV(
        csvBuffer,
        projectService['createProject'].bind(projectService),
      ),
    ).rejects.toThrowError('Invalid file format');
  });
});

describe('ProjectService - getProjects', () => {
  let projectService: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
  });

  it('should retrieve all projects with specified relations included when projects exist', async () => {
    const mockProjects = [
      { id: 1, certifier: {}, developper: {}, country: {}, company: {}, projectsSdgs: [] },
      { id: 2, certifier: {}, developper: {}, country: {}, company: {}, projectsSdgs: [] }
    ];
    const prismaService = { project: { findMany: jest.fn().mockResolvedValue(mockProjects) } };
    const result = await projectService.getProjects();

    expect(result).toEqual(mockProjects);
    expect(prismaService.project.findMany).toHaveBeenCalledWith({
      include: { carbonCredits: false, certifier: true, developper: true, country: true, company: true, projectsSdgs: true, stock: false, vintages: false, allocations: false },
    });
  });
});
