import { Logger } from "@nestjs/common";
import { Args, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { Project } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Resolver('Developper')
export class DevelopperResolver {
    private readonly logger = new Logger(DevelopperResolver.name);

    constructor(private prisma: PrismaService) { }
}
