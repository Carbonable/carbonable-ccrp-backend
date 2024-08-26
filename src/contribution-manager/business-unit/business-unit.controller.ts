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
import { BusinessUnitService } from './business-unit.service';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';

@ApiTags('business-units')
@Controller('business-units')
export class BusinessUnitController {
  private readonly logger = new Logger(BusinessUnitController.name);

  constructor(private businessUnitService: BusinessUnitService) {}

  @Roles(Role.Admin)
  @Post('upload')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload Business unit CSV file' })
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
  async uploadBusinessUnitsCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    this.logger.debug(`File uploaded: ${file.originalname}`);

    return await this.businessUnitService.processCsv(file.buffer);
  }

  @Roles(Role.User)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get business units' })
  @ApiResponse({ status: 200, description: 'Return business units.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getBusinessUnits() {
    return this.businessUnitService.getBusinessUnits();
  }
}
