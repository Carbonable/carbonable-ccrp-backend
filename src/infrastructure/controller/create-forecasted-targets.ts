import {
  Body,
  Controller,
  Logger,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateForecastedTargetsRequest,
  CreateForecastedTargetsUseCase,
} from '../../domain/business-unit';
import { PrismaService } from '../prisma.service';

class Item {
  @IsNumber()
  year: number;
  @IsNumber()
  quantity: number;
}
class CreateForecastedTargetsRequestDTO {
  @ValidateNested({ each: true })
  @Type(() => Item)
  @IsArray()
  data: Item[];

  @IsString()
  businessUnitId: string;
}

@Controller('create-forecasted-targets')
export class CreateForecastedTargetsController {
  private readonly logger = new Logger(CreateForecastedTargetsController.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly createForecastedTargetsUseCase: CreateForecastedTargetsUseCase,
  ) {}

  @Post()
  async createForecastedTargets(
    @Body() requestDto: CreateForecastedTargetsRequestDTO,
  ) {
    this.logger.log('Creating forecasted targets...');

    const businessUnit = await this.prismaService.businessUnit.findUnique({
      where: { id: requestDto.businessUnitId },
    });

    if (null === businessUnit) {
      throw new NotFoundException('Business unit not found');
    }

    const request = new CreateForecastedTargetsRequest(
      requestDto.businessUnitId,
      requestDto.data.map((item) => ({
        year: item.year,
        target: item.quantity,
        id: null,
      })),
    );

    const response = await this.createForecastedTargetsUseCase.execute(request);
    return {
      businessUnit: await this.prismaService.businessUnit.findUnique({
        where: { id: response.id },
      }),
    };
  }
}
