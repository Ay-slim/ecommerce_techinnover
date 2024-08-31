import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserAuthDto } from "../auth/types";

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { role }: UserAuthDto = request["info"];
    return ["admin", "superadmin"].includes(role);
  }
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { role }: UserAuthDto = request["info"];
    return role === "superadmin";
  }
}
