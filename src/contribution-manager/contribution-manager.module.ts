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
import { CompanyController } from './company/company.controller';
import { CompanyService } from './company/company.service';
import { DevelopperController } from './developper/developper.controller';
import { DevelopperService } from './developper/developper.service';
import { BusinessUnitService } from './business-unit/business-unit.service';
import { BusinessUnitController } from './business-unit/business-unit.controller';
import { CertifierService } from './certifier/certifier.service';
import { ProjectSdgsService } from './project-sdgs/project-sdgs.service';
import { ProjectSdgsController } from './project-sdgs/project-sdgs.controller';
import { CountryService } from './country/country.service';
import { CountryController } from './country/country.controller';
import { ProjectService } from './project/project.service';
import { ProjectController } from './project/project.controller';
import { CarbonCreditService } from './carbon-credits/carbon-credits.service';
import { CarbonCreditController } from './carbon-credits/carbon-credits.controller';
import { ForecastEmissionController } from './forecast/forecast-emission.controller';
import { ForecastTargetController } from './forecast/forecast-target.controller';
import { ForecastService } from './forecast/forecast.service';
import { AllocationController } from './allocations/allocations.controller';
import { AllocationService } from './allocations/allocations.service';
import { VintageController } from './vintage/vintage.controller';
import { VintageService } from './vintage/vintage.service';
import { CertifierController } from './certifier/certifier.controller';

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
    ProjectService,
    GlobalDataService,
    ProjectedDecarbonationService,
    ImpactMetricsService,
    ProjectMetricsService,
    ProjectFundingAllocationService,
    CarbonAssetAllocationService,
    DevelopperService,
    CertifierService,
    CompanyService,
    ProjectSdgsService,
    CountryService,
    BusinessUnitService,
    CarbonCreditService,
    VintageService,
    AllocationService,
    ForecastService,
  ],
  controllers: [
    ProjectController,
    DevelopperController,
    CertifierController,
    CompanyController,
    BusinessUnitController,
    ProjectSdgsController,
    CountryController,
    CarbonCreditController,
    ForecastEmissionController,
    ForecastTargetController,
    VintageController,
    AllocationController,
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
    CertifierResolver,
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
