import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
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
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload developper CSV file' })
  @ApiResponse({ status: 201, description: 'File successfully processed.' })
  @ApiResponse({ status: 400, description: 'Invalid file format.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadDevelopperCSV(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    this.logger.debug(`File uploaded: ${file.originalname}`);

    return await this.developperService.processCsv(file.buffer);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all developpers' })
  @ApiResponse({ status: 200, description: 'Return all developpers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllDeveloppers() {
    return await this.developperService.getDeveloppers();
  }
}
