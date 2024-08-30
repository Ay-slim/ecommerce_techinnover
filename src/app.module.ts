import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/module';
import { AuthModule } from './auth/module';
import { ProductsModule } from './products/module';
import { AdminModule } from './admin/module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    AdminModule,
    ProductsModule,
  ],
})
export class AppModule {}
