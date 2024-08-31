import {
  Body,
  Controller,
  Post,
  Get,
  BadRequestException,
  UseGuards,
  Req,
  Patch,
} from "@nestjs/common";
import { Request } from "express";
import { RegisterUserDto } from "../auth/types";
import {
  ALREADY_EXISTS_ERROR_MESSAGE,
  DEFAULT_FETCH_LIMIT,
} from "src/utils/constants";
import { AdminGuard, SuperAdminGuard } from "./guard";
import { UsersService } from "src/users/service";
import { ProductsService } from "src/products/service";
import { failureResponse, successResponse } from "src/utils/formatResponses";
import { ControllerReturnType } from "src/utils/types";
import { z } from "zod";
import { zodRequestValidation } from "src/utils/zodValidation";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
// import { Public } from 'src/utils/publicRoutes';
// import { AdminService } from './service';

@ApiTags("admin")
@Controller("admin")
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
  @ApiOperation({
    summary: "Create admin (only accessible by superadmin)",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              name: "Already",
              email: "already@user.com",
              password: "ayo",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Created successfully.",
    schema: {
      type: "object",
    },
    example: {
      data: {
        name: "Already",
        email: "already@user.com",
        _id: "66d24f57e6443eb007d0e18c",
        banned: false,
        role: "user",
      },
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 400, description: "Error: Account already exists" })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async create(@Body() createUserDto: RegisterUserDto) {
    try {
      const validator = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      });
      zodRequestValidation(validator, createUserDto);
      const { name, email, password } = createUserDto;
      const existingAdmin = await this.userService.findByEmail(email);
      if (existingAdmin) {
        throw new BadRequestException(ALREADY_EXISTS_ERROR_MESSAGE);
      }
      const adminDetails = await this.userService.create({
        name,
        email,
        password,
        role: "admin",
      });
      return successResponse(adminDetails, "Admin created", 201, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @UseGuards(AdminGuard)
  @Get("users")
  @ApiOperation({
    summary:
      "Fetches all users, filtering using the filter param. Request query parameters: (page, limit, filter (enum: banned | active | all)))",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    schema: {
      type: "integer",
      example: 1,
    },
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results per page",
    schema: {
      type: "integer",
      example: 20,
    },
  })
  @ApiQuery({
    name: "filter",
    required: false,
    description: "Filter users by status (enum: banned, active, all)",
    schema: {
      type: "string",
      enum: ["banned", "active", "all"],
      example: "active",
    },
  })
  @ApiResponse({
    status: 200,
    description: "Fetched successfully.",
    schema: {
      type: "object",
    },
    example: {
      data: {
        users: [
          {
            _id: "66d20e18c05a0ece91b3ec19",
            name: "Ayo",
            email: "ayo@user.com",
            role: "user",
            banned: false,
          },
          {
            _id: "66d20e32c05a0ece91b3ec1c",
            name: "Man",
            email: "man@user.com",
            role: "user",
            banned: false,
          },
        ],
        pages: 3,
      },
      message: "Users fetched",
      statusCode: 200,
      success: true,
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({
    status: 422,
    description:
      'Error: Error: invalid_enum_value: filter field value is invalid: Invalid enum value. Expected "banned" | "active" | "all", received "unbanned"',
  })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async findUsers(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const {
        page: rawPage,
        limit: rawLimit,
        filter,
      } = JSON.parse(JSON.stringify(request.query));
      const validator = z.object({
        rawPage: z.string().optional(),
        rawLimit: z.string().optional(),
        filter: z.enum(["banned", "active", "all"]).optional(),
      });
      zodRequestValidation(validator, {
        rawPage,
        rawLimit,
        filter,
      });
      const usersFilter =
        filter === "banned"
          ? { banned: true, role: "user" }
          : filter === "active"
            ? { banned: false, role: "user" }
            : { role: "user" };
      const data = await this.userService.findAll(
        {
          page: Number(rawPage) || 1,
          limit: Number(rawLimit) || DEFAULT_FETCH_LIMIT,
        },
        usersFilter,
      );
      return successResponse(data, "Users fetched", 200, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @UseGuards(AdminGuard)
  @Patch("user")
  @ApiOperation({
    summary:
      "Ban or unban user. _id (id of user to be banned or unbanned) and decision (enum: ['ban', 'unban']) are required parameters",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              _id: "66d24f57e6443eb007d0e18c",
              decision: "ban",
            },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: "_id",
    required: true,
    description: "Id of the user to ban or unban",
    schema: {
      type: "string",
      example: "66d20e32c05a0ece91b3ec1c",
    },
  })
  @ApiQuery({
    name: "decision",
    required: true,
    description: "Decide whether to ban or unban a user (enum: ban, unban)",
    schema: {
      type: "string",
      enum: ["ban", "unban"],
      example: "ban",
    },
  })
  @ApiResponse({
    status: 201,
    description: "User banned",
    schema: {
      type: "object",
    },
    example: {
      data: {
        name: "Already",
        email: "already@user.com",
        _id: "66d24f57e6443eb007d0e18c",
        banned: false,
        role: "user",
      },
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({
    status: 422,
    description:
      "Error: invalid_enum_value: decision field value is invalid: Invalid enum value. Expected 'ban' | 'unban', received 'bandit'",
  })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async banOrUnbanUser(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const { _id, decision } = request.query;
      const validator = z.object({
        _id: z.string(),
        decision: z.enum(["ban", "unban"]),
      });
      zodRequestValidation(validator, {
        _id,
        decision,
      });
      const decisionUpdate =
        decision === "ban"
          ? { banned: true }
          : decision === "unban"
            ? { banned: false }
            : { banned: null };
      const data = await this.userService.banOrUnban(
        _id as string,
        decisionUpdate,
      );
      if (!data) {
        throw new BadRequestException("Error: Product not found");
      }
      delete data["password"];
      return successResponse(
        { name: data.name },
        `User ${decision === "ban" ? "banned" : "unbanned"}`,
        201,
        true,
      );
    } catch (e) {
      failureResponse(e);
    }
  }

  @UseGuards(AdminGuard)
  @Get("products")
  @ApiOperation({
    summary:
      "Fetches all products, filtering using the filter param Request query parameters: (page, limit, filter (enum: approved | rejected | pending | all))",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    schema: {
      type: "integer",
      example: 1,
    },
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of results per page",
    schema: {
      type: "integer",
      example: 20,
    },
  })
  @ApiQuery({
    name: "filter",
    required: false,
    description:
      "Filter products by status (enum: pending, approved, rejected, all)",
    schema: {
      type: "string",
      enum: ["pending", "approved", "rejected", "all"],
      example: "active",
    },
  })
  @ApiResponse({
    status: 200,
    description: "Fetched successfully.",
    schema: {
      type: "object",
    },
    example: {
      data: {
        products: [
          {
            _id: "66d20f1ed9ba094b905526b0",
            name: "Macbooks",
            qty: 500,
            price: 3000,
            media_urls: [],
            approved: false,
          },
          {
            _id: "66d253a1d643efc7b5382337",
            name: "All is well",
            qty: 50,
            price: 20000,
            media_urls: ["first.png"],
            approved: null,
          },
        ],
        pages: 2,
      },
      message: "Products fetched",
      statusCode: 200,
      success: true,
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async findProducts(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const {
        page: rawPage,
        limit: rawLimit,
        filter,
      } = JSON.parse(JSON.stringify(request.query));
      const validator = z.object({
        rawPage: z.string().optional(),
        rawLimit: z.string().optional(),
        filter: z.enum(["pending", "approved", "rejected", "all"]).optional(),
      });
      zodRequestValidation(validator, {
        rawPage,
        rawLimit,
        filter,
      });
      const productsFilter =
        filter === "pending"
          ? { approved: null }
          : filter === "approved"
            ? { approved: true }
            : filter === "rejected"
              ? { approved: false }
              : {};
      const data = await this.productService.findAll(
        {
          page: Number(rawPage) || 1,
          limit: Number(rawLimit) || DEFAULT_FETCH_LIMIT,
        },
        productsFilter,
      );
      return successResponse(data, "Products fetched", 200, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @UseGuards(AdminGuard)
  @Patch("product")
  @ApiOperation({
    summary:
      "Approve or reject a product. Query parameters _id (id of the product to approve or reject) and decision (enum: ['approve', 'reject'] are required",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              _id: "66d24f57e6443eb007d0e18c",
              decision: "approve",
            },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: "_id",
    required: true,
    description: "Id of the product to approve or reject",
    schema: {
      type: "string",
      example: "66d20e32c05a0ece91b3ec1c",
    },
  })
  @ApiQuery({
    name: "decision",
    required: true,
    description:
      "Decide whether to approve or reject a product (enum: approve | reject)",
    schema: {
      type: "string",
      enum: ["approve", "reject"],
      example: "approve",
    },
  })
  @ApiResponse({
    status: 201,
    description: "Product approved",
    schema: {
      type: "object",
    },
    example: {
      data: {
        _id: "66d20f7ef83432c824297cc4",
        name: "Glocks",
        qty: 260,
        price: 2000,
        media_urls: ["xmac.png", "madarista.d.jpeg"],
        approved: true,
        user_id: "66d20e18c05a0ece91b3ec19",
        __v: 0,
      },
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({
    status: 422,
    description:
      "Error: invalid_enum_value: decision field value is invalid: Invalid enum value. Expected 'approve' | 'reject', received 'approvde'",
  })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async approveOrRejectProduct(
    @Req() request: Request,
  ): Promise<ControllerReturnType> {
    try {
      const { _id, decision } = request.query;
      const validator = z.object({
        _id: z.string(),
        decision: z.enum(["approve", "reject"]),
      });
      zodRequestValidation(validator, {
        _id,
        decision,
      });
      if (!["approve", "reject"].includes(decision as string)) {
        throw new BadRequestException(
          "Error: Decision must be approve or reject",
        );
      }
      const decisionUpdate =
        decision === "approve"
          ? { approved: true }
          : decision === "reject"
            ? { approved: false }
            : { approved: null };
      const data = await this.productService.approveOrReject(
        _id as string,
        decisionUpdate,
      );
      if (!data) {
        throw new BadRequestException("Error: Product not found");
      }
      return successResponse(
        data,
        `Product ${decision === "approve" ? "approved" : "rejected"}`,
        201,
        true,
      );
    } catch (e) {
      failureResponse(e);
    }
  }
}
