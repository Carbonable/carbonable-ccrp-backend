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
  StockResolver,
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
import { CsvModule } from '../../src/csv/csv.module';
import { DevelopperController } from './developper/developper.controller';
import { DevelopperService } from './developper/developper.service';

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
    AllocationResolver,
    StockResolver,
    GlobalDataService,
    ProjectedDecarbonationService,
    ImpactMetricsService,
    ProjectMetricsService,
    ProjectFundingAllocationService,
    CarbonAssetAllocationService,
    DevelopperService,
  ],
  controllers: [DevelopperController],
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
    StockResolver,
    ProjectedDecarbonationService,
    ImpactMetricsService,
    ProjectMetricsService,
    ProjectFundingAllocationService,
    CarbonAssetAllocationService,
  ],
  imports: [InfrastructureModule, CsvModule],
})
export class ContributionManagerModule {}
