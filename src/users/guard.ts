import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { UserAuthDto } from '../auth/types';

@Injectable()
export class UnbannedUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { banned, role }: UserAuthDto = request["info"];
    return !banned && role === 'user';
  }
}