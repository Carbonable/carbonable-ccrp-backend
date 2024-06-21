import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { UsersService } from './users.service';
import { Role } from 'src/roles/role.enum';

@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}

  @Get('name/:username')
  @Roles(Role.Admin)
  getUserByName(@Param('username') username: string) {
    return this.userService.findOneByName(username);
  }

  @Get('id/:userid')
  @Roles(Role.Admin)
  getUserById(@Param('userid') userid: string) {
    return this.userService.findOneById(userid);
  }
  @Get('all/')
  @Roles(Role.Admin)
  getAllUser() {
    return this.userService.fetchAll();
  }
}
