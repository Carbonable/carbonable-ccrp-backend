import { Logger } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { PrismaService } from '../prisma.service';

@Resolver('Developper')
export class DevelopperResolver {
  private readonly logger = new Logger(DevelopperResolver.name);

  constructor(private prisma: PrismaService) {}
}
