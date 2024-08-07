import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevelopperService } from './developper.service';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';

@ApiTags('developper')
@Controller('developper')
export class DevelopperController {
  private readonly logger = new Logger(DevelopperController.name);

  constructor(private developperService: DevelopperService) {}

  @Roles(Role.Admin)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload developper CSV file' })
  @ApiResponse({ status: 201, description: 'File successfully processed.' })
  @ApiResponse({ status: 400, description: 'Invalid file format.' })
  async uploadDevelopperCSV(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    this.logger.debug(`File uploaded: ${file.originalname}`);

    return await this.developperService.processCsv(file.buffer);
  }
}
