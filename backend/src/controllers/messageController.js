import User from "../models/userModel.js";
import Message from "../models/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";

// * getting users on sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(500).json({ message: "USER NOT FOUND WHILE GETTING" });
    }
    const otherUsers = await User.find({ _id: { $ne: user._id } }).select(
      "-password"
    );
    if (!otherUsers) {
      return res.status(400).json({ message: "ERROR IN FINDING OTHER USERS" });
    }
    res.status(200).json(otherUsers);
  } catch (e) {
    console.log("ERROR IN GETTINGUSERSFORSIDEBAR ", e.message);
    return res.status(400).json({ message: "INTERNAL SERVER ERROR" });
  }
};

// * getting messages from user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: userToChatId, recieverId: myId },
        { recieverId: userToChatId, senderId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("ERROR IN GETMESSAGE CONTROLLER ", error.message);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};

// * sending messages
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const recieverId = req.params.id;
    const { text, image } = req.body;
    let imageUrl;
    if (image) {
      // ? upload image to cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadedResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      recieverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    // TODO: realtime functinality will be performed later
    const recieverSocketId=getRecieverSocketId(recieverId)
    if(recieverSocketId){
      io.to(recieverSocketId).emit('newMessage',newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("ERROR IN SENDMESSAGE CONTROLLER ", error.message);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};
