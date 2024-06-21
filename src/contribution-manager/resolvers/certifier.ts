import { Logger } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Certifier } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma.service';
import { Public } from '../../auth/auth.public.decorator';

@Resolver('Certifier')
export class CertifierResolver {
  private readonly logger = new Logger(CertifierResolver.name);

  constructor(private prisma: PrismaService) {}

  @Public()
  @Query('certifierBy')
  async getCertifierBy(
    @Args('field') field: string,
    @Args('value') value: string,
  ) {
    return this.prisma.certifier.findFirst({ where: { [field]: value } });
  }

  @Public()
  @ResolveField()
  async projects(@Parent() certifier: Certifier) {
    const { id } = certifier;
    return this.prisma.project.findMany({ where: { certifierId: id } });
  }
}
