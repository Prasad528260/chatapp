import express from "express";
import {signup,login,logout, updateProfile, checkAuth} from "../controllers/authController.js"
import { userAuth } from "../middlewares/userAuth.js";


const authRouter = express.Router();

authRouter.post("/signup",signup);

authRouter.post("/login",login);

authRouter.post("/logout",logout);

authRouter.put('/update-profile',userAuth,updateProfile)

authRouter.get("/check",userAuth,checkAuth)

export default authRouter;
