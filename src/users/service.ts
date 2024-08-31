import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { CreateUserDto } from "./types";
import { User } from "./interface";
import { PaginationDto } from "src/utils/types";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @Inject("USER_MODEL")
    private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password: rawPassword, role } = createUserDto;
    const password = await bcrypt.hash(rawPassword, 10);
    const createdUser = this.userModel.create({
      name,
      email,
      password,
      role,
    });
    return createdUser;
  }

  async banOrUnban(
    _id: string,
    updateUserDto: { banned: boolean },
  ): Promise<User> {
    return this.userModel.findByIdAndUpdate(_id, updateUserDto);
  }

  async findAll(
    paginationDto: PaginationDto,
    filter: {
      banned?: boolean;
    },
  ): Promise<{users: User[], pages: number}> {
    const { page, limit } = paginationDto;
    const startIdx = (page - 1) * limit;
    const users = await this.userModel
      .find(filter, "name email _id role banned")
      .skip(startIdx)
      .limit(limit);
    const count = await this.userModel.countDocuments(filter);
    return {
      users,
      pages: Math.ceil(count / limit)
    }
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({
      email,
    });
  }
}
