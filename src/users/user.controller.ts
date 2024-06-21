import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { UsersService } from './users.service';
import { Role } from '../roles/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from './user.entity'; // Assuming you have a User entity defined

@ApiTags('users')
@ApiBearerAuth() // if your endpoints require authentication
@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}

  @Get('name/:username')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get user by username' })
  @ApiParam({
    name: 'username',
    required: true,
    description: 'Username of the user',
  })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserByName(@Param('username') username: string) {
    return this.userService.findOneByName(username);
  }

  @Get('id/:userid')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'userid', required: true, description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('userid') userid: string) {
    return this.userService.findOneById(userid);
  }

  @Get('all/')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'All users retrieved',
    type: [User],
  })
  getAllUser() {
    return this.userService.fetchAll();
  }
}
