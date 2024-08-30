import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'user']
  },
  banned: {
    type: Boolean,
    default: false,
  },
});
