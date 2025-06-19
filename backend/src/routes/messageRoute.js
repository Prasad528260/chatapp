import express from 'express'
import { userAuth } from '../middlewares/userAuth.js';
import { getMessages, getUsersForSidebar,sendMessage } from '../controllers/messageController.js';


const messageRouter=express.Router();
messageRouter.get('/users',userAuth,getUsersForSidebar)
messageRouter.get('/:id',userAuth,getMessages)
messageRouter.post('/send/:id',userAuth,sendMessage)



export default messageRouter;
