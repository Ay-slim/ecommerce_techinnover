import { Controller, Post, Req, UseGuards, Patch, BadRequestException, Delete, Get, Param } from '@nestjs/common';
import { Request } from 'express';
import { ProductsService } from 'src/products/service';
import { UnbannedUserGuard } from './guard';
import { failureResponse, successResponse } from 'src/utils/formatResponses';
import { ControllerReturnType } from 'src/utils/types';
import { DEFAULT_FETCH_LIMIT } from 'src/utils/constants';
import { z } from 'zod';
import { zodRequestValidation } from 'src/utils/zodValidation';

@Controller('users')
export class UsersController {
  constructor(
    private readonly productsService: ProductsService
  ) {}

  @UseGuards(UnbannedUserGuard)
  @Post('product')
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
        media_urls: z.string().array().optional()
      });
      zodRequestValidation(validator, {
        name, description, qty, price, media_urls,
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
  @Get('products')
  async findProducts(@Req() request: Request): Promise<ControllerReturnType>  {
    try {
      const {
        page: rawPage,
        limit: rawLimit
      } = JSON.parse(JSON.stringify(request.query));
      const validator = z.object({
        rawPage: z.string(),
        rawLimit: z.string(),
      });
      zodRequestValidation(validator, {
        rawPage, rawLimit,
      });
      const { _id: user_id } = request["info"];
      const data = await this.productsService.findAll({
        page: Number(rawPage) || 1,
        limit: Number(rawLimit) || DEFAULT_FETCH_LIMIT,
      }, {
        user_id,
      });
      return successResponse(data, "Products fetched", 200, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @UseGuards(UnbannedUserGuard)
  @Patch('product')
  async updateProduct(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const updateProductDto = request.body;
      const validator = z.object({
        _id: z.string(),
        price: z.number().optional(),
        qty: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional()
      });
      zodRequestValidation(validator, updateProductDto);
      const { _id } = updateProductDto;
      const { _id: user_id } = request["info"]
      delete updateProductDto["_id"];
      delete updateProductDto["approved"];
      const data = await this.productsService.userUpdate({_id, user_id}, updateProductDto);
      if (!data) {
        throw new BadRequestException("Error: Product not found");
      }
      return successResponse(data, "Product updated", 201, true);
    } catch (e) {
      failureResponse(e);
    }
  }

  @UseGuards(UnbannedUserGuard)
  @Delete('product/:_id')
  async deleteProduct(@Param() deleteProductDto: {_id: string}): Promise<ControllerReturnType> {
    try {
      const validator = z.object({
        _id: z.string(),
      });
      zodRequestValidation(validator, deleteProductDto);
      const {_id} = deleteProductDto;
      const data = await this.productsService.delete(_id as string);
      if (!data) {
        throw new BadRequestException("Product not found");
      }
      return successResponse(data, "Product deleted", 201, true);
    }  catch (e) {
      failureResponse(e);
    }
  }
}
