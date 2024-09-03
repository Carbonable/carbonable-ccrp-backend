import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma.module';
import { UserController } from './user.controller';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController, AdminController],
  providers: [AdminService],
})
export class UsersModule {}
