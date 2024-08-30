import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateProductDto, UpdateProductDto } from './types';
import { Product } from './interface';
import { PaginationDto } from 'src/utils/types';

@Injectable()
export class ProductsService {
  constructor(@Inject('PRODUCT_MODEL') private readonly productModel: Model<Product>) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const {
      name,
      description,
      qty,
      price,
      user_id,
      media_urls,
    } = createProductDto;
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
    }
  ): Promise<Product[]> {
    const {
      page, limit
    } = paginationDto;
    const startIdx = (page - 1) * limit;
    return this.productModel.find(filter, "name description qty price _id media_urls").skip(startIdx).limit(limit);
  }

  async userUpdate(filter: {_id: string; user_id: string}, updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productModel.findOneAndUpdate(filter, updateProductDto);
  }

  async approveOrReject(_id: string, updateProductDto: { approved?: boolean }): Promise<Product> {
    return this.productModel.findByIdAndUpdate(_id, updateProductDto);
  }

  async delete(_id: string): Promise<Product> {
    return this.productModel.findByIdAndDelete(_id);
  }
}
