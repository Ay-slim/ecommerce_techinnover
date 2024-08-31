import { HttpStatus } from "@nestjs/common/enums";
import { Product } from "src/products/interface";
import { PaginatedProducts } from "src/products/types";
import { User } from "src/users/interface";
import { PaginatedUsers } from "src/users/types";

export type PaginationDto = {
  page: number;
  limit: number;
};

export type MixedSchemaTypes = User | User[] | Product | Product[];

export type ControllerReturnType = {
  data: User | Product | { name: string } | PaginatedUsers | PaginatedProducts;
  success: boolean;
  message: string;
  statusCode: HttpStatus;
};
