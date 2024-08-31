import {
  Controller,
  Post,
  Req,
  UseGuards,
  Patch,
  BadRequestException,
  Delete,
  Get,
} from "@nestjs/common";
import { Request } from "express";
import { ProductsService } from "src/products/service";
import { UnbannedUserGuard } from "./guard";
import { failureResponse, successResponse } from "src/utils/formatResponses";
import { ControllerReturnType } from "src/utils/types";
import { DEFAULT_FETCH_LIMIT } from "src/utils/constants";
import { z } from "zod";
import { zodRequestValidation } from "src/utils/zodValidation";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("user")
@Controller("user")
export class UsersController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(UnbannedUserGuard)
  @Post("product")
  @Post()
  @ApiOperation({
    summary: "Creates a user product",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              name: "My Life",
              description: "Bill Clinton's biography",
              qty: 50,
              price: 2000,
              media_urls: ["first.png"],
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
  @ApiResponse({
    status: 422,
    description:
      "Error: invalid_type: description field value is invalid: Expected string, received number",
  })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async createProduct(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const {
        name,
        description,
        qty,
        price,
        media_urls,
      }: {
        name: string;
        description: string;
        qty: number;
        price: number;
        media_urls: string[];
      } = request.body;
      const validator = z.object({
        name: z.string(),
        description: z.string(),
        qty: z.number(),
        price: z.number(),
        media_urls: z.string().array().optional(),
      });
      zodRequestValidation(validator, {
        name,
        description,
        qty,
        price,
        media_urls,
      });
      const { _id: user_id } = request["info"];
      const data = await this.productsService.create({
        name,
        description,
        qty,
        price,
        media_urls,
        user_id,
      });
      return successResponse(data, "Product created", 201, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @UseGuards(UnbannedUserGuard)
  @Get("products")
  @ApiOperation({
    summary: "Fetches all of this user's products. Request query parameters: (page, limit)",
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
      const { page: rawPage, limit: rawLimit } = JSON.parse(
        JSON.stringify(request.query),
      );
      const validator = z.object({
        rawPage: z.string(),
        rawLimit: z.string(),
      });
      zodRequestValidation(validator, {
        rawPage,
        rawLimit,
      });
      const { _id: user_id } = request["info"];
      const data = await this.productsService.findAll(
        {
          page: Number(rawPage) || 1,
          limit: Number(rawLimit) || DEFAULT_FETCH_LIMIT,
        },
        {
          user_id,
        },
      );
      return successResponse(data, "Products fetched", 200, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @UseGuards(UnbannedUserGuard)
  @Patch("product")
  @ApiOperation({
    summary: "Update a product's info",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: {
              _id: "66d24f57e6443eb007d0e18c",
              description: "Bill Clinton's biography",
              qty: 50,
              price: 2000,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Product updated",
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
      "Error: invalid_type: description field value is invalid: Expected string, received number",
  })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async updateProduct(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const updateProductDto = request.body;
      const validator = z.object({
        _id: z.string(),
        price: z.number().optional(),
        qty: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
      });
      zodRequestValidation(validator, updateProductDto);
      const { _id } = updateProductDto;
      const { _id: user_id } = request["info"];
      delete updateProductDto["_id"];
      delete updateProductDto["approved"];
      const data = await this.productsService.userUpdate(
        { _id, user_id },
        updateProductDto,
      );
      if (!data) {
        throw new BadRequestException("Error: Product not found");
      }
      return successResponse(data, "Product updated", 201, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @UseGuards(UnbannedUserGuard)
  @Delete("product/:_id")
  @ApiOperation({ summary: "Deletes a product" })
  @ApiResponse({
    status: 201,
    description: "Product deleted",
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
      message: "Product deleted",
      statusCode: 201,
      success: true,
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 422, description: "Error: Product not found" })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async deleteProduct(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const deleteProductDto = request.params;
      const validator = z.object({
        _id: z.string(),
      });
      zodRequestValidation(validator, deleteProductDto);
      const { _id } = deleteProductDto;
      const { _id: user_id } = request["info"];
      const data = await this.productsService.delete(_id as string, user_id);
      if (!data) {
        throw new BadRequestException("Error: Product not found");
      }
      return successResponse(data, "Product deleted", 201, true);
    } catch (e) {
      failureResponse(e);
    }
  }
}
