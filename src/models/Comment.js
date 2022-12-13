import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema({
  contant: { type: String, required: true },
  createAt: { type: Date, required: true, default: Date.now },
  owner: { type: Schema.Types.ObjectId, required: true, rel: "User" },
  meta: {
    good: { type: Number, default: 0, required: true },
    bad: { type: Number, default: 0, required: true },
  },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
