import { Module } from '@nestjs/common';
import { AdminController } from './controller';
import { AdminService } from './service';
import { UsersService } from '../users/service';
import { DatabaseModule } from '../database/database.module';
import { usersProviders } from 'src/users/providers';
import { productsProviders } from 'src/products/providers';
import { ProductsService } from 'src/products/service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [AdminController],
  providers: [
    UsersService,
    ...usersProviders,
    ProductsService,
    ...productsProviders,
    AdminService,
  ],
})
export class AdminModule {}
