import { model, Schema } from "mongoose";

const commentSchema = new Schema({
  // question: { type: Schema.Types.ObjectId, ref: "Question" },
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Number, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updateAt: { type: Number },
  updateBy: { type: Schema.Types.ObjectId, ref: "User" },
  bubbleId: { type: String },
});

export const Comments = model("Comment", commentSchema);
