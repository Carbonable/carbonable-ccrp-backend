import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { ChangePasswordDto } from './password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UserDto } from './user.dto';
import { Get } from '@nestjs/common';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}

  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @Post('update-password')
  @ApiOperation({ summary: 'Change password' })
  @Roles(Role.User)
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200 })
  changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    const { sub: userId } = req.user;

    return this.userService.updateUserPassword(
      userId,
      body.name,
      body.previousPassword,
      body.password,
    );
  }
  @Roles(Role.Admin)
  @Post('createuser')
  @ApiOperation({ summary: 'Create new user' })
  @ApiBearerAuth()
  @ApiBody({ type: UserDto })
  @ApiResponse({ status: 200, description: 'User created successfully' })
  createUser(@Body() req: UserDto) {
    return this.userService.createUser(
      req.username,
      req.password,
      req.companyId,
    );
  }

  @Roles(Role.User)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'User profile' })
  profile(@Req() req) {
    const { sub: userId } = req.user;
    return this.userService.getUserProfile(userId);
  }
}
