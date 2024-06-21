import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from './auth.public.decorator';

import { AuthService } from './auth.service';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { UserDto } from '../users/createuser.dto';

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
}
