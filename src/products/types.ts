export type CreateProductDto = {
  name: string;
  description: string;
  qty: number;
  price: number;
  user_id: string;
  media_urls?: string[];
}

export type UpdateProductDto = {
  name?: string;
  description?: string;
  qty?: number;
  price?: number;
  media_urls?: string[];
}