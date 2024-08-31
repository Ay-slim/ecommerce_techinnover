import * as mongoose from "mongoose";

export const ProductSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number,
  description: String,
  media_urls: [String],
  approved: {
    type: Boolean,
    default: null,
  },
  user_id: mongoose.Types.ObjectId,
});
