import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: (value) => {
        if (!validator.isEmail(value)) {
          throw new Error("EMAIL IS NOT VALID");
        }
      },
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      validate: (value) => {
        if (!validator.isStrongPassword(value)) {
          throw new Error("PASSWORD IS NOT STRONG");
        }
      },
    },
    profilePic: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    },
  },
  {
    timestamps: true,
  }
);
const userModel = mongoose.model("User", userSchema);
export default userModel;
