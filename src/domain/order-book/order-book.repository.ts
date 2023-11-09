import { EffectiveCompensation, Order } from '.';

export interface OrderBookRepositoryInterface {
  listOrdersFor(id: string): Promise<Array<Order>>;
  save(orders: Array<Order>): Promise<void>;
  findByBusinessUnitIds(businessUnitIds: Array<string>): Promise<Array<Order>>;
  // throws error on not found
  findOrderForDemand(businessUnitId: string, year: string): Promise<Order>;

  getBusinessUnitYearlyEffectiveCompensation(
    businessUnitId: string,
  ): Promise<EffectiveCompensation[]>;
  getCompanyYearlyEffectiveCompensation(
    companyId: string,
  ): Promise<EffectiveCompensation[]>;
  getProjectYearlyEffectiveCompensation(
    projectId: string,
  ): Promise<EffectiveCompensation[]>;
}
