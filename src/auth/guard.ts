import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from './service';
import { UserAuthDto } from './types';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../utils/public_routes';
import { ACCESS_DENIED_ERROR_MESSAGE } from 'src/utils/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const tokens = this.extractTokenFromCookie(request);
    if (!tokens) {
      console.log("No tokens found");
      throw new UnauthorizedException(ACCESS_DENIED_ERROR_MESSAGE);
    }
    const { access_token, refresh_token } = tokens;
    let userData: UserAuthDto;
    try {
      userData = await this.jwtService.verifyAsync(access_token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      if (userData.banned) {
        console.log("Banned user");
        throw new UnauthorizedException(ACCESS_DENIED_ERROR_MESSAGE);
      }
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = userData;
      return true;
    } catch {}
    try {
      userData = await this.jwtService.verifyAsync(refresh_token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      if (userData.banned) {
        console.log("Banned user");
        throw new UnauthorizedException(ACCESS_DENIED_ERROR_MESSAGE);
      }
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = userData;
      const {
        access_token: new_access_token,
        refresh_token: new_refresh_token
      } = await this.authService.generateTokens(userData);
      response.cookie('tokens', {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      });
    } catch (e) {
      console.log(e, 'Error in auth guard')
      throw new UnauthorizedException(ACCESS_DENIED_ERROR_MESSAGE);
    }
    return true;
  }

  private extractTokenFromCookie(
    request: Request,
  ): { access_token: string; refresh_token: string } | undefined {
    const { tokens } = request.cookies;
    return tokens;
  }
}
