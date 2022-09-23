import mongoose from "mongoose";
const { Schema } = mongoose;

const videoSchema = new Schema({
    title: String,
    description: String,
    createdAt: Date,
    hashtags: [{ type: String }],
    meta: {
        views: Number,
        rating: Number,
    },
});

const Video = mongoose.model("Video", videoSchema);

export default Video;