import { EffectiveCompensation, EffectiveContribution, Order } from '.';

export interface OrderBookRepositoryInterface {
  listOrdersFor(id: string): Promise<Array<Order>>;
  save(orders: Array<Order>): Promise<void>;
  findByBusinessUnitIds(businessUnitIds: Array<string>): Promise<Array<Order>>;
  // throws error on not found
  findOrderForDemand(businessUnitId: string, year: string): Promise<Order>;

  getBusinessUnitYearlyEffectiveCompensation(
    businessUnitId: string,
  ): Promise<EffectiveCompensation[]>;
  getBusinessUnitYearlyEffectiveContribution(
    businessUnitId: string,
  ): Promise<EffectiveContribution[]>;
  getCompanyYearlyEffectiveCompensation(
    companyId: string,
  ): Promise<EffectiveCompensation[]>;
  getProjectYearlyEffectiveCompensation(
    projectId: string,
  ): Promise<EffectiveCompensation[]>;

  getCompanyOrders(companyId: string): Promise<Order[]>;
  getProjectOrders(projectId: string): Promise<Order[]>;

  getProjectTotalInvestedAmount(projectId: string): Promise<number>;
  getBusinessUnitTotalInvestedAmount(businessUnitId: string): Promise<number>;
  getCompanyTotalInvestedAmount(companyId: string): Promise<number>;
}
