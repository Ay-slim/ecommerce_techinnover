import { HttpStatus } from "@nestjs/common";
import { Product } from "src/products/interface";
import { User } from "src/users/interface";

export const successResponse = (
  data: User | Product | Product[],
  message: string,
  statusCode: HttpStatus,
  success: boolean,
) => {
  return {
    data,
    message,
    statusCode,
    success
  }
}

