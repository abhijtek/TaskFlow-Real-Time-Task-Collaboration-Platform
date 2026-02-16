import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["created", "updated", "moved", "deleted", "assigned"],
      required: true,
    },
    entity: {
      type: String,
      enum: ["board", "list", "task"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

export const Activity = mongoose.model("Activity", activitySchema);
