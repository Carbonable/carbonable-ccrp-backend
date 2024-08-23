import { Body, Controller, Post } from '@nestjs/common';
import { Public } from './auth.public.decorator';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthDto } from './auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  signIn(@Body() req: AuthDto) {
    return this.authService.signIn(req.username, req.password);
  }
}
