import { Module } from '@nestjs/common';
import { UsersController } from './controller';
import { UsersService } from './service';
import { usersProviders } from './providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, ...usersProviders],
})
export class UsersModule {}
