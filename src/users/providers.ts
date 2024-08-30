import { Mongoose } from 'mongoose';
import { UserSchema } from './schema';

export const usersProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Users', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
