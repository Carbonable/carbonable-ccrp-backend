export type VisualizationStrategyKeyInput = {
  companyId?: string;
  businessUnitId?: string;
  projectId?: string;
};

export const annualPlanningKey = getKeys('ANNUAL-PLANNING');
export const cumulativePlanningKey = getKeys('CUMULATIVE-PLANNING');
export const netZeroKey = getKeys('NET-ZERO');
export const financialAnalysisKey = getKeys('FINANCIAL-ANALYSIS');

function getKeys(
  prefix: string,
): (input: VisualizationStrategyKeyInput) => string {
  return function (input: VisualizationStrategyKeyInput): string {
    if (input.companyId) {
      return `${prefix}#COMPANY#${input.companyId}`;
    }
    if (input.businessUnitId) {
      return `${prefix}#BUSINESSUNIT#${input.businessUnitId}`;
    }
    if (input.projectId) {
      return `${prefix}#PROJECT#${input.projectId}`;
    }
    throw new Error('Invalid arguments');
  };
}
