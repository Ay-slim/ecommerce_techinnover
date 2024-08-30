import { Mongoose } from 'mongoose';
import { ProductSchema } from './schema';

export const productsProviders = [
  {
    provide: 'PRODUCT_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Products', ProductSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
