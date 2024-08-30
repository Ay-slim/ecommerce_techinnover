import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/module';
import { AuthModule } from './auth/module';
import { ProductsModule } from './products/module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    ProductsModule,
  ],
})
export class AppModule {}
