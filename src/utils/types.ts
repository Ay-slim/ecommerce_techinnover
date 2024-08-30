import { HttpStatus } from "@nestjs/common/enums";
import { Product } from "src/products/interface";
import { User } from "src/users/interface";

export type PaginationDto = {
  page: number;
  limit: number;
}

export type MixedSchemaTypes = User | Product | Product[];

export type ControllerReturnType = {
  data: MixedSchemaTypes;
  success: boolean;
  message: string;
  statusCode: HttpStatus
}