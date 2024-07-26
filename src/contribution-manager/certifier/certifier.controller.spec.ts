import { Test, TestingModule } from '@nestjs/testing';
import { CertifierController } from './certifier.controller';
import { CertifierService } from './certifier.service';
import { Logger } from '@nestjs/common';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

describe('CertifierController', () => {
  let app: INestApplication;
  const certifierService = { processCsv: jest.fn() };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CertifierController],
      providers: [
        {
          provide: CertifierService,
          useValue: certifierService,
        },
        Logger,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/POST certifier/upload should process file successfully', async () => {
    certifierService.processCsv.mockResolvedValueOnce({
      message: 'File successfully processed.',
    });

    return request(app.getHttpServer())
      .post('/certifier/upload')
      .attach(
        'file',
        Buffer.from('id,name,slug\n1,Certifier One,certifier-one'),
        'companies.csv',
      )
      .expect(201)
      .expect({ message: 'File successfully processed.' });
  });

  it('/POST certifier/upload should upload multiple companies', async () => {
    certifierService.processCsv.mockResolvedValueOnce({
      message: 'File successfully processed.',
    });

    return request(app.getHttpServer())
      .post('/certifier/upload')
      .attach(
        'file',
        Buffer.from(
          'id,name,slug\n1,Certifier One,certifier-one2,Certifier Two,certifier-two3,Certifier Three,certifier-three',
        ),
        'companies.csv',
      )
      .expect(201)
      .expect({ message: 'File successfully processed.' });
  });

  it('/POST certifier/upload should handle invalid file format', async () => {
    certifierService.processCsv.mockRejectedValueOnce(
      new BadRequestException('Invalid file format'),
    );

    return request(app.getHttpServer())
      .post('/certifier/upload')
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
