import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
    console.log(' in req');
    console.table(req.user);
    const { sub: userId } = req.user;

    return this.userService.updateUserPassword(
      userId,
      body.name,
      body.previousPassword,
      body.password,
    );
  }
}
