import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByName(username);
    this.logger.log(username, ' wants to sign');
    if (!user || !(await bcryptjs.compare(pass, user.password))) {
      throw new UnauthorizedException(
        !user ? `User :${username} not found` : 'Invalid password',
      );
    }
    const payload = {
      sub: user.id,
      username: user.id,
      roles: user.roles,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
