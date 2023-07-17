import { Module } from '@nestjs/common';
import GraphQLJSON from 'graphql-type-json';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { CertifierResolver, CountryResolver, ProjectResolver, DevelopperResolver, CarbonCreditResolver } from './resolvers';
import { GlobalDataService, ProjectedDecarbonationService, ImpactMetricsService, ProjectMetricsService, ProjectFundingAllocationService } from './services';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: process.env.NODE_ENV !== 'production',
            typePaths: [path.join("src/schemas/*.graphql")],
            resolvers: { JSON: GraphQLJSON },
        }),
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService, CertifierResolver, CountryResolver, ProjectResolver, DevelopperResolver, CarbonCreditResolver, GlobalDataService, ProjectedDecarbonationService, ImpactMetricsService, ProjectMetricsService, ProjectFundingAllocationService]
})
export class AppModule { }
