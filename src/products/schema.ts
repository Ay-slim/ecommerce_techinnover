import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number,
  media_urls: [String],
  approved: {
    type: Boolean,
    default: false,
  },
  user_id: mongoose.Types.ObjectId,
});
