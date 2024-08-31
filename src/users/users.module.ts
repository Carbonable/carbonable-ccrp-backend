import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma.module';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
})
export class UsersModule {}
