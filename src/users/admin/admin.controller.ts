import { ApiTags } from '@nestjs/swagger';
import { Controller, Delete } from '@nestjs/common';

import { Roles } from '../../roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { AdminService } from './admin.service';

@ApiTags('Critical Operations')
@Roles(Role.Admin)
@Controller('user')
export class AdminController {
  constructor(private adminService: AdminService) {}
  @Delete('reset-database')
  async profile(): Promise<{ message: string }> {
    return this.adminService.resetDB();
  }
}
