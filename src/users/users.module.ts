import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../infrastructure/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
