import { Logger } from '@nestjs/common';
import { Query, Args, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../../infrastructure/prisma.service';
import { Public } from '../../auth/auth.public.decorator';

@Resolver('Country')
export class CountryResolver {
  private readonly logger = new Logger(CountryResolver.name);

  constructor(private prisma: PrismaService) {}

  @Public()
  @Query('countries')
  async getCountries() {
    return this.prisma.country.findMany();
  }

  @Public()
  @Query('countryBy')
  async getCountryBy(
    @Args('field') field: string,
    @Args('value') value: string,
  ) {
    return this.prisma.country.findFirst({ where: { [field]: value } });
  }
}
