import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { CreateProductDto, UpdateProductDto } from "./types";
import { Product } from "./interface";
import { PaginationDto } from "src/utils/types";
import { PaginatedProducts } from "src/users/types";

@Injectable()
export class ProductsService {
  constructor(
    @Inject("PRODUCT_MODEL") private readonly productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { name, description, qty, price, user_id, media_urls } =
      createProductDto;
    return this.productModel.create({
      name,
      description,
      qty,
      price,
      user_id,
      media_urls,
    });
  }

  async findAll(
    paginationDto: PaginationDto,
    filter: {
      approved?: boolean;
      user_id?: string;
    },
  ): Promise<PaginatedProducts> {
    const { page, limit } = paginationDto;
    const startIdx = (page - 1) * limit;
    const products = await this.productModel
      .find(filter, "name description qty price _id media_urls approved")
      .skip(startIdx)
      .limit(limit);
    const count = await this.productModel.countDocuments(filter);
    return {products, pages: Math.ceil(count/limit)}
  }

  async userUpdate(
    filter: { _id: string; user_id: string },
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productModel.findOneAndUpdate(filter, updateProductDto, {
      returnOriginal: false,
    });
  }

  async approveOrReject(
    _id: string,
    updateProductDto: { approved?: boolean },
  ): Promise<Product> {
    return this.productModel.findByIdAndUpdate(_id, updateProductDto);
  }

  async delete(_id: string, user_id: string): Promise<Product> {
    return this.productModel.findOneAndDelete({
      _id,
      user_id,
    });
  }
}
