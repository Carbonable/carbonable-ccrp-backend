import { Module } from '@nestjs/common';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CustomerResolver } from './customer.resolver';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: process.env.NODE_ENV !== 'production',
            typePaths: [path.join("src/schemas/*.graphql")],
        }),
    ],
    controllers: [AppController],
    providers: [AppService, CustomerResolver],
})
export class AppModule { }
