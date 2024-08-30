import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { ProductsService } from 'src/products/service';
import { DEFAULT_FETCH_LIMIT } from 'src/utils/constants';
import { failureResponse, successResponse } from 'src/utils/formatResponses';
import { Public } from 'src/utils/publicRoutes';
import { ControllerReturnType } from 'src/utils/types';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService
  ) {}

  @Public()
  @Get()
  async findApprovedProducts(@Req() request: Request): Promise<ControllerReturnType>  {
    try {
      const {
        page: rawPage,
        limit: rawLimit
      } = JSON.parse(JSON.stringify(request.query));
      const data = await this.productsService.findAll({
        page: Number(rawPage) || 1,
        limit: Number(rawLimit) || DEFAULT_FETCH_LIMIT,
      }, {
        approved: true,
      });
      return successResponse(data, "Products fetched", 200, true);
    } catch (e) {
      console.log(e);
      failureResponse(e);
    }
  }
}
