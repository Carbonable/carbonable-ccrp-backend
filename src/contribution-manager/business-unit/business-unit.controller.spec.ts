import { Test, TestingModule } from '@nestjs/testing';
import { BusinessUnitController } from './business-unit.controller';
import { BusinessUnitService } from './business-unit.service';
import { Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

describe('BusinessUnitController', () => {
  let controller: BusinessUnitController;
  let service: BusinessUnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessUnitController],
      providers: [
        {
          provide: BusinessUnitService,
          useValue: {
            processCsv: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    controller = module.get<BusinessUnitController>(BusinessUnitController);
    service = module.get<BusinessUnitService>(BusinessUnitService);
  });

  it('should upload company CSV successfully', async () => {
    const mockFile = {
      originalname: 'test.csv',
      buffer: Buffer.from(''),
    } as Express.Multer.File;
    jest
      .spyOn(service, 'processCsv')
      .mockResolvedValue({ message: 'BusinessUnits uploaded successfully' });

    const result = await controller.uploadBusinessUnitsCsv(mockFile);

    expect(result).toEqual({ message: 'BusinessUnits uploaded successfully' });
    expect(service.processCsv).toHaveBeenCalledWith(mockFile.buffer);
  });

  it('should handle error during file upload', async () => {
    const mockFile = {
      originalname: 'test.csv',
      buffer: Buffer.from(''),
    } as Express.Multer.File;
    jest
      .spyOn(service, 'processCsv')
      .mockRejectedValue(new BadRequestException('Invalid file format'));

    await expect(controller.uploadBusinessUnitsCsv(mockFile)).rejects.toThrow(
      BadRequestException,
    );
  });
});
