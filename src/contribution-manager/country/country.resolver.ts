import { Logger } from '@nestjs/common';
import { Query, Args, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../../infrastructure/prisma.service';
import { Public } from '../../auth/auth.public.decorator';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Countries')
@Resolver('Country')
export class CountryResolver {
  private readonly logger = new Logger(CountryResolver.name);

  constructor(private prisma: PrismaService) {}

  @Public()
  @ApiOperation({ summary: 'Retrieve a list of all countries' })
  @ApiResponse({
    status: 200,
    description: 'List of countries retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Query('countries')
  async getCountries() {
    return this.prisma.country.findMany();
  }

  @Public()
  @ApiOperation({ summary: 'Retrieve a country by a specific field' })
  @ApiQuery({
    name: 'field',
    description: 'The field to search by',
    example: 'name',
  })
  @ApiQuery({
    name: 'value',
    description: 'The value of the field',
    example: 'France',
  })
  @ApiResponse({ status: 200, description: 'Country found successfully' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Query('countryBy')
  async getCountryBy(
    @Args('field') field: string,
    @Args('value') value: string,
  ) {
    return this.prisma.country.findFirst({ where: { [field]: value } });
  }
}
