import { BadRequestException, Controller, Get, InternalServerErrorException, Req } from '@nestjs/common';
import { Request } from 'express';
import { ProductsService } from 'src/products/service';
import { DEFAULT_FETCH_LIMIT, INTERNAL_SERVER_ERROR_MESSAGE } from 'src/utils/constants';
import { successResponse } from 'src/utils/formatResponses';
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
      if (e?.message?.startsWith("Error: ")) {
        throw new BadRequestException(e?.message);
      } else {
        throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);
      }
    }
  }
}
