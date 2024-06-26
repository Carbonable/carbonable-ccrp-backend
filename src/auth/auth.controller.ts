import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Public } from './auth.public.decorator';
import { AuthService } from './auth.service';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { UserDto } from '../users/user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: UserDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  signIn(@Body() req: UserDto) {
    return this.authService.signIn(req.username, req.password);
  }

  @Roles(Role.Admin)
  @Post('createuser')
  @ApiOperation({ summary: 'Create new user' })
  @ApiBearerAuth()
  @ApiBody({ type: UserDto })
  @ApiResponse({ status: 200, description: 'User created successfully' })
  createUser(@Body() req: UserDto) {
    return this.authService.createUser(req.username, req.password);
  }

  @Roles(Role.User)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'User profile' })
  profile(@Req() req) {
    const { sub: userId } = req.user;
    return this.authService.getUserProfile(userId);
  }
}
