import { HttpStatus } from "@nestjs/common/enums";
import { Product } from "src/products/interface";
import { User } from "src/users/interface";

export type PaginationDto = {
  page: number;
  limit: number;
};

export type MixedSchemaTypes = User | User[] | Product | Product[];

export type ControllerReturnType = {
  data: User | User[] | Product | Product[] | { name: string };
  success: boolean;
  message: string;
  statusCode: HttpStatus;
};
