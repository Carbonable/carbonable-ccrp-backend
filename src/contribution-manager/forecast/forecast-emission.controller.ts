import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ForecastService } from './forecast.service';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';
import { ForecastType } from './types';

@ApiTags('forecast-emission')
@Controller('forecast-emission')
export class ForecastEmissionController {
  private readonly logger = new Logger(ForecastEmissionController.name);

  constructor(private forecastService: ForecastService) {}

  @Roles(Role.Admin)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload Forecast Emission CSV file' })
  @ApiResponse({ status: 201, description: 'File successfully processed.' })
  @ApiResponse({ status: 400, description: 'Invalid file format.' })
  async uploadForecastEmissionsCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    this.logger.debug(`File uploaded: ${file.originalname}`);
    return await this.forecastService.processCsv(
      file.buffer,
      ForecastType.EMISSION,
    );
  }
}
