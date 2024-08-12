import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../infrastructure/prisma.module';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UserController],
})
export class UsersModule {}
