import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload project CSV file' })
  @ApiResponse({ status: 201, description: 'File successfully processed.' })
  @ApiResponse({ status: 400, description: 'Invalid file format.' })
  async uploadProjectCSV(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string }> {
    this.logger.debug(`File uploaded: ${file.originalname}`);

    return await this.projectService.processCsv(file.buffer);
  }
}
