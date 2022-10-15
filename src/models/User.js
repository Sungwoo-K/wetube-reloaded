import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema({
    email : { type:String, require: true, unique: true  },
    username : { type:String, require: true, unique: true  },
    password : {type:String, require:true },
    name:{type:String, required: true},
    location: String,
});

userSchema.pre("save", async function() {
   this.password = await bcrypt.hash(this.password, 5);
})

const User = mongoose.model("User", userSchema);

export default User;