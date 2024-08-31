import { Product } from "src/products/interface";
import { User } from "./interface";

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type PaginatedUsers = {
  users: User[];
  pages: number;
};
