import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
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

    const hashedPassword = await this.hashPassword(password);
    const userCreated = await this.prisma.user.create({
      data: {
        id: ulid().toString(),
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
  private async hashPassword(password: string): Promise<string> {
    const CARBONABLE_SALT = parseInt(process.env.CARBONABLE_SALT);
    return await bcryptjs.hash(password, CARBONABLE_SALT);
  }
  async updateUserPassword(
    id: string,
    name: string,
    previousPassword: string,
    password: string,
  ): Promise<{ message: string }> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.name !== name) {
      throw new BadRequestException('Username not matching token holders id');
    }
    const isPasswordMatching = await bcryptjs.compare(
      previousPassword,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('Previous password is incorrect');
    }

    const hashedPassword = await this.hashPassword(password);

    const userCreated = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
    this.logger.log(
      `User password modified: ${userCreated.name}  id:${userCreated.id}`,
    );
    return {
      message: 'Password modified',
    };
  }
}
