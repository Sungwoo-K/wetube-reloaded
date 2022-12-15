import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema({
  contant: { type: String, required: true },
  createAt: { type: Date, required: true, default: Date.now },
  // user-profile 에서 내가 쓴 댓글을 찾을 시 그 댓글을 쓴 video로 가기위한 videos
  videos: { type: Schema.Types.ObjectId, ref: "Video" },
  // user-profile 에서 내가 쓴 댓글을 찾기위한 comment의 owner
  owner: { type: Schema.Types.ObjectId, required: true, rel: "User" },
  meta: {
    good: { type: Number, default: 0, required: true },
    bad: { type: Number, default: 0, required: true },
  },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
