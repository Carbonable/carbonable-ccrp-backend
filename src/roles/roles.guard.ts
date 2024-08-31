import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<string>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const role = request.currentRole;
    if (!requiredRole) {
      return true;
    }
    if (!role) {
      this.logger.warn('User roles not found on request');
      return false;
    }
    const hasRole = role === requiredRole;
    if (!hasRole) {
      this.logger.warn(`User does not have the required role: ${requiredRole}`);
    }
    return hasRole;
  }
}
