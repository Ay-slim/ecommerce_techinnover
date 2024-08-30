import { BadRequestException, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { Product } from "src/products/interface";
import { User } from "src/users/interface";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "./constants";

export const successResponse = (
  data: User | User[] | Product | Product[] | {name: string},
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

export const failureResponse = (
  e: {
    message: string;
  },
) => {
  if (e?.message?.startsWith("Error: ")) {
    throw new BadRequestException(e?.message);
  } else {
    throw new InternalServerErrorException(INTERNAL_SERVER_ERROR_MESSAGE);
  }
}
