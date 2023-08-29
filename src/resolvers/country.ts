import { Logger } from '@nestjs/common';
import { Query, Args, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../prisma.service';

@Resolver('Country')
export class CountryResolver {
  private readonly logger = new Logger(CountryResolver.name);

  constructor(private prisma: PrismaService) {}

  @Query('countries')
  async getCountries() {
    return this.prisma.country.findMany();
  }

  @Query('countryBy')
  async getCountryBy(
    @Args('field') field: string,
    @Args('value') value: string,
  ) {
    return this.prisma.country.findFirst({ where: { [field]: value } });
  }
}
