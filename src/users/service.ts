import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto } from './types';
import { User } from './interface';
import { PaginationDto } from 'src/utils/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject('USER_MODEL') private readonly userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const {
      name,
      email,
      password: rawPassword,
      role,
    } = createUserDto;
    const password = await bcrypt.hash(rawPassword, 10);
    const createdUser = this.userModel.create({
      name,
      email,
      password,
      role,
    });
    return createdUser;
  }

  async findAll(
    paginationDto: PaginationDto,
    filter: {
      banned?: boolean
    }
  ): Promise<User[]> {
    const {
      page, limit
    } = paginationDto;
    const startIdx = (page - 1) * limit;
    return this.userModel.find(filter).skip(startIdx).limit(limit);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({
      email,
    });
  }
}
