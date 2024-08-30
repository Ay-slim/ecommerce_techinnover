import { Controller, Post, Req, UseGuards, Patch, BadRequestException, Delete, Get } from '@nestjs/common';
import { Request } from 'express';
import { ProductsService } from 'src/products/service';
import { UnbannedUserGuard } from './guard';
import { failureResponse, successResponse } from 'src/utils/formatResponses';
import { ControllerReturnType } from 'src/utils/types';
import { DEFAULT_FETCH_LIMIT } from 'src/utils/constants';

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
      console.log(e);
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
      const { _id: user_id } = request["info"];
      const data = await this.productsService.findAll({
        page: Number(rawPage) || 1,
        limit: Number(rawLimit) || DEFAULT_FETCH_LIMIT,
      }, {
        user_id,
      });
      return successResponse(data, "Products fetched", 200, true);
    } catch (e) {
      console.log(e);
      failureResponse(e);
    }
  }

  @UseGuards(UnbannedUserGuard)
  @Patch('product')
  async updateProduct(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const updateProductDto = request.body;
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
      console.log(e);
      failureResponse(e);
    }
  }

  @UseGuards(UnbannedUserGuard)
  @Delete('product')
  async deleteProduct(@Req() request: Request): Promise<ControllerReturnType> {
    try {
      const { _id } = request.query;
      const data = await this.productsService.delete(_id as string);
      if (!data) {
        throw new BadRequestException("Product not found");
      }
      return successResponse(data, "Product deleted", 201, true);
    }  catch (e) {
      console.log(e);
      failureResponse(e);
    }
  }
}
