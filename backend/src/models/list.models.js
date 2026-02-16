import mongoose, { Schema } from "mongoose";

const listSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    position: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true },
);

export const List = mongoose.model("List", listSchema);
