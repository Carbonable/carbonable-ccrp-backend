import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  async createManyOfType(tableName: string, values: any[]) {
    const modelName = this.toCamelCase(tableName);

    try {
      await this[modelName].createMany({ data: values, skipDuplicates: true });
    } catch (error) {
      const errorParsed = parsePrismaError(error);
      this.logger.error(
        `Error creating ${tableName}: ${JSON.stringify(errorParsed)}`,
      );
      throw new BadRequestException(errorParsed);
    }
  }

  private toCamelCase(str: string): string {
    return str.replace(/([-_][a-z])/gi, (group) =>
      group.toUpperCase().replace('-', '').replace('_', ''),
    );
  }
}

interface ParsedError {
  type: string;
  message: string;
  statusCode: number;
  meta?: any;
}

const parsePrismaError = (error: any): ParsedError => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          type: error.name,
          message: `Unique constraint failed on the fields: ${error.meta?.target}`,
          meta: error.meta,
          statusCode: 409,
        };
      case 'P2025':
        return {
          type: error.name,
          message: 'Record not found',
          meta: error.meta,
          statusCode: 404,
        };
      default:
        return {
          type: 'UnknownPrismaClientKnownRequestError',
          message: error.message,
          meta: error.meta,
          statusCode: 400,
        };
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: 400,
      type: 'Bad Request',
      message: error.message,
    };
  } else if (
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError
  ) {
    return {
      statusCode: 500,
      type: error.name,
      message: error.message,
    };
  } else {
    return {
      statusCode: 500,
      type: error.name,
      message: error.message,
    };
  }
};
