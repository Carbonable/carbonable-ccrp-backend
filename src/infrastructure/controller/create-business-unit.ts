import {
  Controller,
  Logger,
  Post,
  Body,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { PrismaService } from '../prisma.service';
import {
  CreateBusinessUnitRequest,
  CreateBusinessUnitUseCase,
} from '../../domain/business-unit';
import { ID_GENERATOR, IdGeneratorInterface } from '../../domain/common';

class CreateBusinessUnitRequestDTO {
  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsNumber()
  @IsOptional()
  forecastEmission?: number;
  @IsNumber()
  @IsOptional()
  target?: number;
  @IsNumber()
  @IsOptional()
  debt?: number;
  @IsString()
  metadata: string;
  @IsString()
  companyId: string;
}

@Controller('create-business-unit')
export class CreateBusinessUnitController {
  private readonly logger = new Logger(CreateBusinessUnitController.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly createBusinessUnitUseCase: CreateBusinessUnitUseCase,
    @Inject(ID_GENERATOR) private readonly idGenerator: IdGeneratorInterface,
  ) {}

  @Post()
  async createBusinessUnit(@Body() requestDto: CreateBusinessUnitRequestDTO) {
    this.logger.log('Creating business unit...');

    const company = await this.prismaService.company.findUnique({
      where: { id: requestDto.companyId },
    });
    if (null === company) {
      throw new NotFoundException('Company not found');
    }

    const request = new CreateBusinessUnitRequest({
      id: this.idGenerator.generate(),
      name: requestDto.name,
      description: requestDto.description,
      forecastEmission: requestDto.forecastEmission,
      target: requestDto.target,
      debt: requestDto.debt,
      metadata: requestDto.metadata,
      companyId: requestDto.companyId,
    });

    const response = await this.createBusinessUnitUseCase.execute(request);

    return { id: response.id };
  }
}
