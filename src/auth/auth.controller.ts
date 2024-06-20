import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from './auth.public.decorator';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { UserDto } from 'src/users/createuser.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  signIn(@Body() req: UserDto) {
    return this.authService.signIn(req.username, req.password);
  }

  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  @Post('createuser')
  createUser(@Body() req: UserDto) {
    return this.authService.createUser(req.username, req.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
