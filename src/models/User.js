import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, require: true, unique: true },
  socialOnly: { type: Boolean, default: false },
  avatar_url: String,
  username: { type: String, require: true, unique: true },
  password: String,
  name: { type: String, required: true },
  location: String,
  videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
