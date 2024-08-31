import { HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { Product } from "src/products/interface";
import { User } from "src/users/interface";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "./constants";
import { PaginatedUsers } from "src/users/types";
import { PaginatedProducts } from "src/products/types";

export const successResponse = (
  data: User | Product | { name: string } | PaginatedUsers | PaginatedProducts,
  message: string,
  statusCode: HttpStatus,
  success: boolean,
) => {
  return {
    data,
    message,
    statusCode,
    success,
  };
};

export const failureResponse = (e: { message: string }) => {
  console.log(e);
  if (e?.message?.startsWith("Error: ")) {
    throw e;
  } else {
    throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);
  }
};
