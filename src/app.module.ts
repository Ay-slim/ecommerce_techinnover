import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/module";
import { AuthModule } from "./auth/module";
import { ProductsModule } from "./products/module";
import { AdminModule } from "./admin/module";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    AdminModule,
    ProductsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
})
export class AppModule {}
