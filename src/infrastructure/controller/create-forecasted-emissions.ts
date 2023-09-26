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
  CreateForecastedEmissionsRequest,
  CreateForecastedEmissionsUseCase,
} from '../../domain/business-unit';
import { PrismaService } from '../prisma.service';

class Item {
  @IsNumber()
  year: number;
  @IsNumber()
  quantity: number;
}
class CreateForecastedEmissionsRequestDTO {
  @ValidateNested({ each: true })
  @Type(() => Item)
  @IsArray()
  data: Item[];

  @IsString()
  businessUnitId: string;
}

@Controller('create-forecasted-emissions')
export class CreateForecastedEmissionsController {
  private readonly logger = new Logger(
    CreateForecastedEmissionsController.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly createForecastedEmissionsUseCase: CreateForecastedEmissionsUseCase,
  ) {}

  @Post()
  async createForecastedTargets(
    @Body() requestDto: CreateForecastedEmissionsRequestDTO,
  ) {
    this.logger.log('Creating forecasted emissions...');

    const businessUnit = await this.prismaService.businessUnit.findUnique({
      where: { id: requestDto.businessUnitId },
    });

    if (null === businessUnit) {
      throw new NotFoundException('Business unit not found');
    }

    const request = new CreateForecastedEmissionsRequest(
      requestDto.businessUnitId,
      requestDto.data.map((item) => ({
        year: item.year,
        emission: item.quantity,
        id: null,
      })),
    );

    const response = await this.createForecastedEmissionsUseCase.execute(
      request,
    );
    return {
      businessUnit: await this.prismaService.businessUnit.findUnique({
        where: { id: response.id },
      }),
    };
  }
}
