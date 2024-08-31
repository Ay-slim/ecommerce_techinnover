import { Module } from "@nestjs/common";
import { UsersController } from "./controller";
import { UsersService } from "./service";
import { usersProviders } from "./providers";
import { DatabaseModule } from "../database/database.module";
import { ProductsService } from "src/products/service";
import { productsProviders } from "src/products/providers";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    ...usersProviders,
    ProductsService,
    ...productsProviders,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class UsersModule {}
