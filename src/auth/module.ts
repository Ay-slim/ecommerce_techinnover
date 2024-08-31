import { Module } from "@nestjs/common";
import { AuthController } from "./controller";
import { AuthService } from "./service";
import { JwtModule } from "@nestjs/jwt";
import { UsersService } from "../users/service";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./guard";
import { DatabaseModule } from "../database/database.module";
import { usersProviders } from "src/users/providers";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    UsersService,
    ...usersProviders,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
