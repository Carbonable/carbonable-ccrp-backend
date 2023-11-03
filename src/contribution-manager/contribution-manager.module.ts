import { Module } from '@nestjs/common';
import {
  CarbonCreditResolver,
  CertifierResolver,
  CountryResolver,
  DevelopperResolver,
  ProjectResolver,
} from './resolvers';
import {
  GlobalDataService,
  ImpactMetricsService,
  ProjectFundingAllocationService,
  ProjectMetricsService,
  ProjectedDecarbonationService,
} from './services';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { BusinessUnitResolver } from './resolvers/business-unit';
import { DemandResolver } from './resolvers/demand';
import { AllocationResolver } from './resolvers/allocations';

@Module({
  providers: [
    CertifierResolver,
    CountryResolver,
    ProjectResolver,
    DevelopperResolver,
    CarbonCreditResolver,
    BusinessUnitResolver,
    DemandResolver,
    AllocationResolver,
    GlobalDataService,
    ProjectedDecarbonationService,
    ImpactMetricsService,
    ProjectMetricsService,
    ProjectFundingAllocationService,
  ],
  exports: [
    CertifierResolver,
    CountryResolver,
    ProjectResolver,
    DevelopperResolver,
    CarbonCreditResolver,
    GlobalDataService,
    BusinessUnitResolver,
    DemandResolver,
    AllocationResolver,
    ProjectedDecarbonationService,
    ImpactMetricsService,
    ProjectMetricsService,
    ProjectFundingAllocationService,
  ],
  imports: [InfrastructureModule],
})
export class ContributionManagerModule {}
