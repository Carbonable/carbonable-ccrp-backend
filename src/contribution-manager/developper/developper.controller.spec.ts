import { Test, TestingModule } from '@nestjs/testing';
import { DevelopperController } from './developper.controller';
import { DevelopperService } from './developper.service';
import { Logger } from '@nestjs/common';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

describe('DevelopperController', () => {
  let app: INestApplication;
  const developperService = { processCsv: jest.fn() };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DevelopperController],
      providers: [
        {
          provide: DevelopperService,
          useValue: developperService,
        },
        Logger,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/POST developper/upload should process file successfully', async () => {
    developperService.processCsv.mockResolvedValueOnce({
      message: 'File successfully processed.',
    });

    return request(app.getHttpServer())
      .post('/developper/upload')
      .attach(
        'file',
        Buffer.from('id,name,slug\n1,Developper One,developper-one'),
        'companies.csv',
      )
      .expect(201)
      .expect({ message: 'File successfully processed.' });
  });

  it('/POST developper/upload should upload multiple companies', async () => {
    developperService.processCsv.mockResolvedValueOnce({
      message: 'File successfully processed.',
    });

    return request(app.getHttpServer())
      .post('/developper/upload')
      .attach(
        'file',
        Buffer.from(
          'id,name,slug\n1,Developper One,developper-one2,Developper Two,developper-two3,Developper Three,developper-three',
        ),
        'companies.csv',
      )
      .expect(201)
      .expect({ message: 'File successfully processed.' });
  });

  it('/POST developper/upload should handle invalid file format', async () => {
    developperService.processCsv.mockRejectedValueOnce(
      new BadRequestException('Invalid file format'),
    );

    return request(app.getHttpServer())
      .post('/developper/upload')
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
