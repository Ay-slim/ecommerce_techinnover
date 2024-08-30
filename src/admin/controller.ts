import { Body, Controller, Post, Get, BadRequestException, UseGuards, Req, Patch } from '@nestjs/common';
import { Request } from 'express';
import { RegisterUserDto } from '../auth/types';
import { DEFAULT_FETCH_LIMIT } from 'src/utils/constants';
import { AdminGuard, SuperAdminGuard } from './guard';
import { UsersService } from 'src/users/service';
import { ProductsService } from 'src/products/service';
import { failureResponse, successResponse } from 'src/utils/formatResponses';
import { ControllerReturnType } from 'src/utils/types';
// import { Public } from 'src/utils/publicRoutes';
// import { AdminService } from './service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly userService: UsersService,
    private readonly productService: ProductsService,
    // private readonly adminService: AdminService,
  ) {}

  // TO BE DELETED AFTER SEEDING!
  // @Public()
  // @Post('seed')
  // async seedSuper() {
  //   await this.adminService.seedSuperAdmin();
  //   return "Super admin seeded";
  // }

  @UseGuards(SuperAdminGuard)
  @Post()
  async create(
    @Body() createUserDto: RegisterUserDto,
  ) {
    try {
      const {
        name,
        email,
        password
      } = createUserDto;
      const userDetails = await this.userService.create({
        name,
        email,
        password,
        role: "admin",
      });
      return successResponse(userDetails, "Admin created", 201, true);
    } catch (e) {
      console.log(e);
      failureResponse(e);
    }
  }

  @UseGuards(AdminGuard)
  @Get('users')
  async findUsers(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const {
        page: rawPage,
        limit: rawLimit,
        filter,
      } = JSON.parse(JSON.stringify(request.query));
      if (!['banned', 'active', 'all'].includes(filter)) {
        throw new BadRequestException("Error: Filter must be banned, active, or all");
      }
      const usersFilter = filter === 'banned' ? { banned: true, role: 'user' } : filter === 'active' ? { banned: false, role: 'user' }: {role: 'user'};
      const data = await this.userService.findAll({
        page: Number(rawPage) || 1,
        limit: Number(rawLimit) || DEFAULT_FETCH_LIMIT,
      }, usersFilter);
      return successResponse(data, "Users fetched", 200, true);
    } catch (e) {
      console.log(e);
      failureResponse(e);
    }
  }

  @UseGuards(AdminGuard)
  @Patch('user')
  async banOrUnbanUser(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const { _id, decision } = request.query;
      if (!['ban', 'unban'].includes(decision as string)) {
        throw new BadRequestException("Decision must be ban or unban");
      }
      const decisionUpdate = decision === 'ban' ? { banned: true } : decision === 'unban' ? {banned: false} : { banned: null };
      const data = await this.userService.banOrUnban(_id as string, decisionUpdate);
      if (!data) {
        throw new BadRequestException("Error: Product not found");
      }
      delete data["password"]
      return successResponse({name: data.name}, `User ${decision === 'ban' ? 'banned': 'unbanned'}`, 201, true);
    } catch (e) {
      console.log(e);
      failureResponse(e);
    }
  }

  @UseGuards(AdminGuard)
  @Get('products')
  async findProducts(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const {
        page: rawPage,
        limit: rawLimit,
        filter,
      } = JSON.parse(JSON.stringify(request.query));
      if (!['pending', 'approved', 'rejected'].includes(filter)) {
        throw new BadRequestException("Error: Filter must be pending, approved, or rejected");
      }
      const productsFilter = filter === 'pending' ? { approved: null} : filter === 'approved' ? { approved: true } : { approved: false};
      const data = await this.productService.findAll({
        page: Number(rawPage) || 1,
        limit: Number(rawLimit) || DEFAULT_FETCH_LIMIT,
      }, productsFilter);
      return successResponse(data, "Users fetched", 200, true);
    } catch (e) {
      console.log(e);
      failureResponse(e);
    }
  }

  @UseGuards(AdminGuard)
  @Patch('product')
  async approveOrRejectProduct(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const { _id, decision } = request.query;
      if (!['approve', 'reject'].includes(decision as string)) {
        throw new BadRequestException("Error: Decision must be approve or reject");
      }
      const decisionUpdate = decision === 'approve' ? { approved: true } : decision === 'reject' ? { approved: false } : { approved: null };
      const data = await this.productService.approveOrReject(_id as string, decisionUpdate);
      if (!data) {
        throw new BadRequestException("Error: Product not found");
      }
      return successResponse(data, `Product ${decision === 'approve' ? 'approved' : 'rejected'}`, 201, true);
    } catch (e) {
      console.log(e);
      failureResponse(e);
    }
  }
}

  

