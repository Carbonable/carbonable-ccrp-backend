import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CARBONABE_SALT } from '../auth/constants';
import { PrismaService } from '../infrastructure/prisma.service';
import { Role } from '../roles/role.enum';
import { Logger } from '@nestjs/common';
import { ulid } from 'ulid';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) {}

  async findOneByName(name: string) {
    return this.prisma.user.findFirst({
      where: { name },
    });
  }
  async findOneById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
  async fetchAll() {
    return this.prisma.user.findMany();
  }

  async createUser(
    name: string,
    password: string,
  ): Promise<{ id: string; name: string; roles: string[] }> {
    const existingUser = await this.findOneByName(name);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, CARBONABE_SALT);
    const userCreated = await this.prisma.user.create({
      data: {
        id: ulid(),
        name,
        password: hashedPassword,
        roles: [Role.User],
      },
    });
    this.logger.log(`User created: ${userCreated.name}  id:${userCreated.id}`);
    return {
      id: userCreated.id,
      name: userCreated.name,
      roles: userCreated.roles,
    };
  }
}
