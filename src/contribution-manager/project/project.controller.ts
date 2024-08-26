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
import { ProjectService } from './project.service';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  private readonly logger = new Logger(ProjectController.name);

  constructor(private projectService: ProjectService) {}

  @Roles(Role.Admin)
  @Post('upload')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload project CSV file' })
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
  async uploadProjectCSV(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    this.logger.debug(`File uploaded: ${file.originalname}`);

    return await this.projectService.processCsv(file.buffer);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get projects' })
  @ApiResponse({ status: 200, description: 'Return projects.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProjects(): Promise<any> {
    return await this.projectService.getProjects();
  }
}
