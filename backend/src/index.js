import express from "express";
import authRouter from "./routes/authRoute.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookirParser from 'cookie-parser'
import messageRouter from "./routes/messageRoute.js";
import cors from 'cors'
import { app,server } from "./lib/socket.js";
import path from 'path'


dotenv.config();
const __dirname=path.resolve();

app.use(cors({
  origin:[
  "http://localhost:5173",
  "https://chatapp-hgyz.onrender.com"
],
  credentials:true
}
))
app.use(express.json());
app.use(cookirParser())
app.use("/api/auth", authRouter);
app.use('/api/messages',messageRouter);

const PORT = process.env.PORT;

if (process.env.NODE_ENV==='production') {
  app.use(express.static(path.join(__dirname,"../frontend/dist")))
  app.get(/(.*)/,(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
  })
}


await connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`server is running on http://localhost:${PORT}`);
    });
  })
  .catch((e) => console.log("APP ERROR : " + e.message));
