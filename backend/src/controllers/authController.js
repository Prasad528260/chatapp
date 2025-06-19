import bcrypt from "bcryptjs";
import { getJWT } from "../lib/utils.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";

//* signup controller
export const signup = async (req, res, next) => {
  try {
    const { email, password, fullName, profilePic } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "PLEASE FILL ALL THE FIELDS" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .send({ message: "PASSWORD MUST BE GREATER THAN 6 CHARACTERS" });
    }
    const user = await User.findOne({
      email,
    });
    if (user) {
      return res.status(400).send({ message: "EMAIL ALREADY EXISTS" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User({
      email,
      fullName,
      password: hashedPassword,
      profilePic,
    });

    if (!newUser) {
      return res.status(400).send({ message: "INVALID USER DATA" });
    }

    // jwt token generate
    const token = getJWT(newUser._id);
    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (e) {
    console.log("ERROR IN SIGNUP CONTROLLER : " + e.message);
    res.status(400).json({ message: "INTERNAL SERVER ERROR IN SIGNING UP" });
  }
};

//* login controller
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "PLEASE FILL ALL THE FIELDS" });
    }
    const user = await User.findOne({ email });
    const hashedPassword = user.password;
    if (!user) {
      return res.status(201).json({ message: "INVALID CREDENTIALS" });
    }
    const validatePassword = await bcrypt.compare(password, hashedPassword);
    if (!validatePassword) {
      return res.status(400).json({ message: "INVALID CREDENTIALS" });
    }
    const token = getJWT(user._id);
    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    // console.log("user loggedin successfully");

    res.status(200).json(user);
  } catch (error) {
    res.status(201).json({ message: "INTERNAL SERVER ERROR IN SIGNING IN" });
  }
};

//* logout controller
export const logout = (req, res, next) => {
  // console.log("you have been loggedout");
  try {
    res.cookie("token", null, { maxAge: 0 });
    res.send("you have been loggedout");
  } catch (e) {
    return res.status(400).json({ message: "INTERNAL ERROR IN LOGGING OUT " });
  }
};

// * get profile
// ! using cloudinary for images very much efficient
export const updateProfile = async (req, res, next) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "PROFILE PIC IS REQUIRED " });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("ERROR IN UPDATING PICTURE: " + error.message);
    return res.status(400).json({ message: "INTERNAL ERROR UPLOADING IMAGE" });
  }
};

export const checkAuth = (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("ERROR IN CHECKAUTH CONTROLLER: " + error.message);
    return res.status(500).json({ message: "INTERNAL ERROR ERROR" });
  }
};
