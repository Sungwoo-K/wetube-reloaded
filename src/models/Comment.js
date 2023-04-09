import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema({
  text: { type: String, required: true },
  createAt: { type: Date, required: true, default: Date.now },
  // user-profile 에서 내가 쓴 댓글을 찾을 시 그 댓글을 쓴 video로 가기위한 videos
  video: { type: Schema.Types.ObjectId, required: true, ref: "Video" },
  owner: { type: Schema.Types.ObjectId, required: true, rel: "User" },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
