import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Utils from '../utils';

type Sdg = {
  number: string;
  name: string;
};

type Metrics = {
  protected_forests: string;
  protected_species: string;
  absorbed_tons: string;
};

@Injectable()
export class ImpactMetricsService {
  constructor(private readonly prismaClient: PrismaService) {}

  async get() {
    const linkedSdgs = await this.prismaClient.$queryRaw<Sdg[]>`
SELECT DISTINCT s.number, s.name
FROM projects p
INNER JOIN projects_sdgs ps on ps.project_id = p.id
INNER JOIN sdg s on s.id = ps.sdg_id
ORDER BY s.number
;
        `;
    const metricsArr = await this.prismaClient.$queryRaw<Metrics[]>`
SELECT
    SUM(p.protected_forest) as protected_forests,
    SUM(p.protected_species) as protected_species,
   SUM(absorbed_cp.absorption) as absorbed_tons
FROM projects p
INNER JOIN curve_point absorbed_cp on p.id = absorbed_cp.project_id and absorbed_cp.time < now()
;
        `;
    const metrics = metricsArr.shift();

    return {
      sdgs: linkedSdgs,
      protected_forest: Utils.formatString({
        value: metrics.protected_forests,
        suffix: 'ha',
      }),
      protected_species: Utils.formatString({
        value: metrics.protected_species,
        prefix: '#',
      }),
      removed_tons: Utils.formatString({
        value: metrics.absorbed_tons,
        suffix: 't',
      }),
    };
  }
}
