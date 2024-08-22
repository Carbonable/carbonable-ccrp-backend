import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { PrismaService } from '../infrastructure/prisma.service';
import { monotonicFactory } from 'ulid';
import {
  CertifierDataFixtures,
  CompanyDataFixtures,
  DevelopperDataFixtures,
  ProjectDataFixtures,
  ProjectsSdgsDataFixtures,
  SdgDataFixtures,
  StockDataFixtures,
  VintageDataFixtures,
} from './fixtures-data/fixtures-models';
import * as bcryptjs from 'bcryptjs';

const ulid = monotonicFactory();

@Command({
  name: 'fixtures',
})
export class BuildFixturesCommand extends CommandRunner {
  private readonly logger = new Logger(BuildFixturesCommand.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  addId(name: string, object: any) {
    if ('projectSdgs' === name || object.hasOwnProperty('id')) {
      return object;
    }

    return {
      ...object,
      id: ulid().toString(),
    };
  }

  resolveReferences(object: any, references: Array<any>) {
    for (const [key, value] of Object.entries(object)) {
      if ('function' !== typeof value) {
        continue;
      }

      object[key] = value(references);
    }

    return object;
  }

  async addFixtures({ connection }) {
    const fixturesManagers = [
      CertifierDataFixtures,
      CompanyDataFixtures,
      DevelopperDataFixtures,
      SdgDataFixtures,
      ProjectDataFixtures,
      ProjectsSdgsDataFixtures,
      VintageDataFixtures,
      StockDataFixtures,
    ];

    const references = [];

    const countries = await this.prisma.country.findMany({
      select: { id: true, name: true },
    });
    references['country'] = countries;

    for (const f of fixturesManagers) {
      const fixture = f({ prismaClient: this.prisma });

      references[fixture.name] = [];

      if (0 !== fixture.data.length) {
        let txData = [];
        for (let d of fixture.data) {
          d = this.addId(fixture.name, d);
          d = this.resolveReferences(d, references);
          references[fixture.name].push(d);
          txData = [...txData, d];
        }
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await fixture.object.createMany({ data: txData });
        } catch (e) {
          console.error(`Failed at ${fixture.name}`);
          console.error(e);
          throw e;
        }
      }

      let fixturesData = [];
      const batchSize = 100;
      for (
        let count = fixture.data.length;
        count < fixture.count + fixture.data.length;
        count++
      ) {
        let item = await fixture.model({ connection, references });
        if (fixture.model.constructor.name === 'AsyncGeneratorFunction') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          for await (let i of item) {
            i = this.addId(fixture.name, i);
            fixturesData = [...fixturesData, i];
          }

          fixturesData = await this.flush(
            fixture,
            count,
            batchSize,
            fixturesData,
          );

          continue;
        }

        item = this.addId(fixture.name, item);
        references[fixture.name].push(item);
        fixturesData = [...fixturesData, item];

        fixturesData = await this.flush(
          fixture,
          count,
          batchSize,
          fixturesData,
        );
      }

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await fixture.object.createMany({ data: fixturesData });
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  }

  async flush<F, T>(
    fixture: F,
    count: number,
    batchSize: number,
    data: Array<T>,
  ): Promise<Array<T>> {
    if (count % batchSize === 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await fixture.object.createMany({ data });
      return [];
    }
    return data;
  }

  async seedCountries() {
    const countries = await this.getCountries();
    for (const country of countries) {
      await this.prisma.country.create({
        data: {
          id: ulid().toString(),
          name: country.name.common,
          code: country.cca2,
          data: country,
        },
      });
    }
  }

  async getCountries(): Promise<any[]> {
    const res = await fetch(
      'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
    );
    return await res.json();
  }
  async seedUsers() {
    const adminExists = await this.prisma.user.findFirst({
      where: { roles: { has: 'admin' } },
    });
    if (!adminExists) {
      const data = await this.getAdmin();
      await this.prisma.user.create({
        data,
      });
    }
  }

  async getAdmin(): Promise<any> {
    const name = process.env.DEFAULT_ADMIN_NAME;
    const password = process.env.DEFAULT_ADMIN_PASSWORD;
    const rolesEnv = process.env.DEFAULT_ADMIN_ROLES;

    if (!rolesEnv || !name || !password) {
      throw new Error(
        'DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_PASSWORD, or DEFAULT_ADMIN_ROLES are not defined in the environment variables',
      );
    }

    const roles = rolesEnv.replace(/[\[\]']/g, '').split(',');
    const CARBONABLE_SALT = parseInt(process.env.CARBONABLE_SALT);
    const hashedPassword = await bcryptjs.hash(password, CARBONABLE_SALT);
    return {
      id: ulid().toString(),
      name,
      password: hashedPassword,
      roles,
    };
  }

  async run(): Promise<void> {
    try {
      await this.seedCountries();
      await this.seedUsers();
      await this.addFixtures({
        connection: this.prisma,
      });

      this.logger.log('Fixtures added successfully');
    } catch (e) {
      this.logger.error(e);
    } finally {
      process.exit(0);
    }
  }
}
