import { Logger } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { PrismaService } from '../../infrastructure/prisma.service';

@Resolver('Vintage')
export class VintageResolver {
  private readonly logger = new Logger(VintageResolver.name);

  constructor(private prisma: PrismaService) {}
}
