import { Controller, Get, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { ProductsService } from "src/products/service";
import { DEFAULT_FETCH_LIMIT } from "src/utils/constants";
import { failureResponse, successResponse } from "src/utils/formatResponses";
import { Public } from "src/utils/publicRoutes";
import { ControllerReturnType } from "src/utils/types";
import { zodRequestValidation } from "src/utils/zodValidation";
import { z } from "zod";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation(
    {
      summary:
        "Fetches all approved products. Request query parameters: (page, limit)",
      parameters: [
        {
          name: "page",
          in: "query",
          schema: {
            type: "integer",
          },
          required: true,
          example: "1",
        },
        {
          name: "limit",
          in: "query",
          schema: {
            type: "integer",
          },
          required: true,
          example: "20",
        },
      ],
    },
    { overrideExisting: true },
  )
  @ApiResponse({
    status: 200,
    description: "Fetched.",
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
          approved: true,
        },
        {
          _id: "66d20f7ef83432c824297cc4",
          name: "Glocks",
          qty: 260,
          price: 2000,
          media_urls: ["xmac.png", "madarista.d.jpeg"],
          approved: true,
        },
      ],
    },
  })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 500, description: "Something went wrong" })
  async findApprovedProducts(
    @Req() request: Request,
  ): Promise<ControllerReturnType> {
    try {
      const { page: rawPage, limit: rawLimit } = JSON.parse(
        JSON.stringify(request.query),
      );
      const validator = z.object({
        rawPage: z.string().optional(),
        rawLimit: z.string().optional(),
      });
      zodRequestValidation(validator, {
        rawPage,
        rawLimit,
      });
      const data = await this.productsService.findAll(
        {
          page: Number(rawPage) || 1,
          limit: Number(rawLimit) || DEFAULT_FETCH_LIMIT,
        },
        {
          approved: true,
        },
      );
      return successResponse(data, "Products fetched", 200, true);
    } catch (e) {
      failureResponse(e);
    }
  }
}
