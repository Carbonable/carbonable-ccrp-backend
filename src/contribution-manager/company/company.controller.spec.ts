import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Logger } from '@nestjs/common';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
// import { HttpStatus, HttpException } from '@nestjs/common';

describe('CompanyController', () => {
  let app: INestApplication;
  const companyService = { processCsv: jest.fn() };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: companyService,
        },
        Logger,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/POST company/upload should process file successfully', async () => {
    companyService.processCsv.mockResolvedValueOnce({
      message: 'File successfully processed.',
    });

    return request(app.getHttpServer())
      .post('/company/upload')
      .attach(
        'file',
        Buffer.from('id,name,slug\n1,Company One,company-one'),
        'companies.csv',
      )
      .expect(201)
      .expect({ message: 'File successfully processed.' });
  });

  it('/POST company/upload should upload multiple companies', async () => {
    companyService.processCsv.mockResolvedValueOnce({
      message: 'File successfully processed.',
    });

    return request(app.getHttpServer())
      .post('/company/upload')
      .attach(
        'file',
        Buffer.from(
          'id,name,slug\n1,Company One,company-one2,Company Two,company-two3,Company Three,company-three',
        ),
        'companies.csv',
      )
      .expect(201)
      .expect({ message: 'File successfully processed.' });
  });

  it('/POST company/upload should handle invalid file format', async () => {
    companyService.processCsv.mockRejectedValueOnce(
      new BadRequestException('Invalid file format'),
    );

    return request(app.getHttpServer())
      .post('/company/upload')
      .attach('file', Buffer.from('invalid data'), 'invalid.csv')
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Invalid file format',
        error: 'Bad Request',
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
