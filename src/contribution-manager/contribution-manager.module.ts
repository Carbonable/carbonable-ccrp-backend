import { Module } from '@nestjs/common';
import {
  CarbonCreditResolver,
  CertifierResolver,
  CountryResolver,
  DevelopperResolver,
  ProjectResolver,
  BusinessUnitResolver,
  DemandResolver,
  AllocationResolver,
  VintageResolver,
  VisualizationResolver,
} from './resolvers';
import {
  GlobalDataService,
  ImpactMetricsService,
  ProjectFundingAllocationService,
  ProjectMetricsService,
  ProjectedDecarbonationService,
  CarbonAssetAllocationService,
} from './services';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

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
    VintageResolver,
    VisualizationResolver,
    GlobalDataService,
    ProjectedDecarbonationService,
    ImpactMetricsService,
    ProjectMetricsService,
    ProjectFundingAllocationService,
    CarbonAssetAllocationService,
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
    VintageResolver,
    VisualizationResolver,
    ProjectedDecarbonationService,
    ImpactMetricsService,
    ProjectMetricsService,
    ProjectFundingAllocationService,
    CarbonAssetAllocationService,
  ],
  imports: [InfrastructureModule],
})
export class ContributionManagerModule {}
