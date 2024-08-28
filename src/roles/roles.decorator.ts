import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Role } from './role.enum';
import { ApiResponse } from '@nestjs/swagger';

export const ROLES_KEY = 'roles';
export const Roles = (role: Role) =>
  applyDecorators(
    ApiResponse({
      status: 403,
      description: `Forbidden: Requires role ${role}`,
    }),
    SetMetadata(ROLES_KEY, role),
  );
