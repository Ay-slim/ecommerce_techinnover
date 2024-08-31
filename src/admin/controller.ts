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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
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
    summary: "Fetches all users, filtering using the filter param",
    parameters: [
      {
        name: "page",
        in: "query",
        schema: {
          type: "integer",
        },
        example: "1",
      },
      {
        name: "limit",
        in: "query",
        schema: {
          type: "integer",
        },
        example: "20",
      },
      {
        name: "filter",
        in: "query",
        schema: {
          type: "string",
        },
        example: "active",
      },
    ],
  })
  @ApiResponse({
    status: 200,
    description: "Fetched successfully.",
    schema: {
      type: "object",
    },
    example: {
      data: [
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
        {
          _id: "66d20e40c05a0ece91b3ec1f",
          name: "Dude",
          email: "dude@user.com",
          role: "user",
          banned: true,
        },
      ],
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
        rawPage: z.string(),
        rawLimit: z.string(),
        filter: z.enum(["banned", "active", "all"]),
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
    summary: "Ban or unban user",
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
    summary: "Fetches all products, filtering using the filter param",
    parameters: [
      {
        name: "page",
        in: "query",
        schema: {
          type: "integer",
        },
        example: "1",
      },
      {
        name: "limit",
        in: "query",
        schema: {
          type: "integer",
        },
        example: "20",
      },
      {
        name: "filter",
        in: "query",
        schema: {
          type: "string",
        },
        example: "approved",
      },
    ],
  })
  @ApiResponse({
    status: 200,
    description: "Fetched successfully.",
    schema: {
      type: "object",
    },
    example: {
      data: [
        {
          _id: "66d20ec0d9ba094b905526ae",
          name: "Gamer console",
          qty: 50,
          price: 500000,
          media_urls: [],
          approved: true,
        },
        {
          _id: "66d20f1ed9ba094b905526b0",
          name: "Macbooks",
          qty: 500,
          price: 3000,
          media_urls: [],
          approved: null,
        },
        {
          _id: "66d20f7ef83432c824297cc4",
          name: "Glocks",
          qty: 260,
          price: 2000,
          media_urls: ["xmac.png", "madarista.d.jpeg"],
          approved: null,
        },
      ],
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
        rawPage: z.string(),
        rawLimit: z.string(),
        filter: z.enum(["pending", "approved", "rejected", "all"]),
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
    summary: "Approve or reject a product",
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
  @ApiResponse({
    status: 201,
    description: "User banned",
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
