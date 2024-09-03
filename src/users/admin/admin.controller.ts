import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Delete } from '@nestjs/common';

import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';
import { AdminService } from './admin.service';

@ApiBearerAuth()
@Roles(Role.Admin)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}
  @Delete('reset-database')
  async resetDB(): Promise<{ message: string }> {
    return this.adminService.resetDB();
  }
}
