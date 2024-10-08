import { Module } from '@nestjs/common';
import GraphQLJSON from 'graphql-type-json';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as path from 'path';
import { ContributionManagerModule } from './contribution-manager/contribution-manager.module';
import { ConsoleModule } from './console/console.module';
import { UsersModule } from './users/users.module';
import { ClerkAuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles/roles.guard';
import { CsvModule } from './csv/csv.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: process.env.NODE_ENV !== 'production',
      typePaths: [path.join('src/schemas/*.graphql')],
      definitions: {
        path: path.join('src/schemas/graphql.autogenerated.ts'),
      },
      resolvers: { JSON: GraphQLJSON },
    }),
    CsvModule,
    ContributionManagerModule,
    ConsoleModule,
    EventEmitterModule.forRoot(),
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
