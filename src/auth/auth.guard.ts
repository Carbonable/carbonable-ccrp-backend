import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.public.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      this.logger.debug('Public route, bypassing authentication');
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn('No Authorization header found');
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      this.logger.warn('No Bearer token found in Authorization header');
      throw new UnauthorizedException('Bearer token is missing');
    }

    try {
      const verifiedToken = await clerkClient.verifyToken(token);
      this.logger.log(verifiedToken);
      const role = verifiedToken?.organizations[process.env.ORG_ID];
      if (!role) {
        this.logger.debug('Verified token :', verifiedToken);
        throw new UnauthorizedException(
          'User is not part of the required organization',
        );
      }

      request.user = verifiedToken;
      request.currentRole = role;
      this.logger.log('Token verified successfully');
      return true;
    } catch (err) {
      this.logger.error('Token verification failed', err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
