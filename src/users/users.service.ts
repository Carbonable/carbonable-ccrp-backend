import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CARBONABE_SALT } from '../auth/constants';
import { Role } from 'src/roles/role.enum';
export type User = {
  userId: number;
  username: string;
  password: string;
  roles: Role[];
};

@Injectable()
export class UsersService {
  private users = [
    {
      userId: 1,
      username: 'john',
      password: '$2b$12$4pyBNlNbQQL80xjBKWZdtu/x1w9DjLNk1iJrWI8w1JBCWgQa5KAL.',
      roles: [Role.Admin],
    },
    {
      userId: 2,
      username: 'maria',
      password: '$2b$12$a3omihnGsdNquFsnU9zKROSp8Sel8HxNPQH7REoW.BIHyDZeaHbd6',
      roles: [Role.User],
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async createUser(username: string, password: string): Promise<User> {
    const existingUser = await this.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    const userCreated: User = {
      userId: Date.now(),
      username,
      password: await bcrypt.hash(password, CARBONABE_SALT),
      roles: Role[Role.User],
    };
    console.log(userCreated);
    this.users.push(userCreated);
    return userCreated;
  }
}
