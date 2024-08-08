import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AllocationService } from './allocations.service';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';

@ApiTags('allocation')
@Controller('allocation')
export class AllocationController {
  private readonly logger = new Logger(AllocationController.name);

  constructor(private allocationService: AllocationService) {}

  @Roles(Role.Admin)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload allocations CSV file' })
  @ApiResponse({ status: 201, description: 'File successfully processed.' })
  @ApiResponse({ status: 400, description: 'Invalid file format.' })
  async uploadAllocationCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    this.logger.debug(`File uploaded: ${file.originalname}`);
    return await this.allocationService.processCsv(file.buffer);
  }
}
