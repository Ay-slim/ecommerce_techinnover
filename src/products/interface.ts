import { Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  description: string;
  qty: number;
  price: number;
  media_urls: [string];
  approved: boolean;
  user_id: string;
}
