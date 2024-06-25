import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByName(username);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
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
  async createUser(
    username: string,
    pass: string,
  ): Promise<{ id: string; name: string; roles: string[] }> {
    return this.usersService.createUser(username, pass);
  }
}
