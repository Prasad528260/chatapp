import jwt from "jsonwebtoken";
import User from '../models/userModel.js'

export const userAuth = async (req, res, next) => {
    const token= req.cookies.token
    if (!token) {
        return res.status(400).json({message:'UNAUTHORIZED - NO TOKEN PROVIDED'})
    }
    const decodedUser= jwt.verify(token,process.env.JWT_SECRET);
    if(!decodedUser)
    {
        return res.status(400).json({message:'UNAUTHORIZED - INVALID TOKEN'})
    }
    const user= await User.findById({_id:decodedUser.userId}).select("-password");
    if(!user){
        return res.status(400).json({message:'UNAUTHORIZED - INVALID USER'})
    }
    req.user=user;
next()
};
