import { Module } from "@nestjs/common";
import { ProductsService } from "./service";
import { productsProviders } from "./providers";
import { DatabaseModule } from "../database/database.module";
import { ProductsController } from "./controller";

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService, ...productsProviders],
})
export class ProductsModule {}
