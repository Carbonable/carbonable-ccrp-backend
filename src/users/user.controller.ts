import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Controller, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Get, Logger } from '@nestjs/common';
import { UserEntity } from './user.entity';

@ApiTags('User Management')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private userService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Retrieve the user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile successfully retrieved.',
    type: UserEntity,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. The request is missing required parameters.',
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden. The user does not have the necessary permissions to access this resource.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error. An unexpected error occurred.',
  })
  profile(@Req() req): UserEntity {
    const ret: UserEntity = {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.emailAddress,
      id: req.user.id,
      orgId: req.user.org_id,
      role: req.currentRole,
    };
    return ret;
  }
}
