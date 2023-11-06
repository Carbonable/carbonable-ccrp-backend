import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';

type AnualProjectedDecarbonation = {
  timePeriod: string;
  emissions: string; // configured by company for {timePeriod} year
  exPostIssued: number; // ex post issued at {timePeriod} year
  exPostPurchased: number; // ex post purchase at {timePeriod} year
  exPostRetired: number; // ex post retired at {timePeriod} year
  neutralityTarget: number; // target fixed by company for {timePeriod} year
  actualRate: number; // percentage of compensation on emissions for {timePeriod} year
  delta: number; // neutralityTarget - actualRate
  debt: number; // emissions cumulated not compensated
  exPostStock: number; // current stock independant of vintage
  exAnteStock: number; // current stock independant of vintage
};

type CumulativeProjectedDecarbonation = {
  timePeriod: string; // year
  emissions: string; // configured by company for {timePeriod} year
  exPostIssued: number; // same data as annualProjectedDecarbonation but cumulative over {timePeriod}
  exPostPurchased: number; // --
  exPostRetired: number; // --
  delta: number; // --
  emissionDebt: number; // --
};

type FinancialAnalysisProjectedDecarbonation = {
  timePeriod: string;
  averagePurchasePrice: number;
  cumulativeAveragePurchasePrice: number;
  totalPurchasedAmount: number;
  cumulativePurchasedAmount: number;
  averageIssuedPrice: number;
  cumulativeAverageIssuedPrice: number;
  totalIssuedAmount: number;
  cumulativeTotalIssuedAmount: number;
  granTotalAmount: number;
  cumulativeGranTotalAmount: number;
  emissionDebtEstimatedAmount: number;
  cumulativeEmissionDebtEstimatedAmount: number;
};

@Injectable()
export class ProjectedDecarbonationTablesService {
  constructor(private prisma: PrismaService) {}

  async getAnual(): Promise<AnualProjectedDecarbonation[]> {
    return [];
  }
  async getCumulative(): Promise<CumulativeProjectedDecarbonation[]> {
    return [];
  }
  async getFinancialAnalysis(): Promise<
    FinancialAnalysisProjectedDecarbonation[]
  > {
    return [];
  }
}
