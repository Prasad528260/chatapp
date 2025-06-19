import { create } from "zustand";
import toast from 'react-hot-toast'
import {axiosInstance} from '../lib/axios.js'
import {useAuthStore} from './useAuthStore.js'

export const useChatStore=create((set,get)=>({
    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoading:false,
    isMessagesLoading:false,
  


    getUsers:async()=>{
        set({isUsersLoading:true})
        try {
            const res= await axiosInstance.get('/messages/users')
            set({users:res.data})
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
        finally{
            set({isUsersLoading:false})
        }
    },
    
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
            return res.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to load messages');
            set({ messages: [] });
            return [];
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    
    sendMessage: async (messageData) => {
        const { selectedUser } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            // The message will be added via socket event, no need to update state here
            return res.data;
        } catch (error) {
            toast.error(error?.response?.data?.message);
            throw error;
        }
    },
    
    setSelectedUser: async (selectedUser) => {
        set({ selectedUser, messages: [] });
        if (selectedUser) {
            await get().getMessages(selectedUser._id);
        }
    },
    subscribeToMessages: () => {
        const { selectedUser } = get();
        const authUser = useAuthStore.getState().authUser;
        if (!selectedUser || !authUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (!newMessage || !newMessage.senderId) return;
            
            const currentState = get();
            const isFromSelectedUser = newMessage.senderId === selectedUser._id;
            const isToSelectedUser = newMessage.receiverId === selectedUser._id;
            const isFromCurrentUser = newMessage.senderId === authUser._id;
            
            // If message is in current chat or from current user
            if (isFromSelectedUser || (isToSelectedUser && isFromCurrentUser)) {
                // Use the addMessage method to handle deduplication
                get().addMessage(newMessage);
            }
        };

        // Clean up any existing listeners
        socket.off('newMessage', handleNewMessage);
        // Add new listener
        socket.on('newMessage', handleNewMessage);
        
        // Return cleanup function
        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    },
    unSubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            // Remove all newMessage listeners
            socket.off('newMessage');
        }
    },
    
    // Add a method to manually add a new message to the state
    addMessage: (newMessage) => {
        set((state) => {
            // Check if message already exists to prevent duplicates
            const messageExists = state.messages.some(
                msg => msg._id === newMessage._id || 
                (msg.senderId === newMessage.senderId && 
                 msg.createdAt === newMessage.createdAt)
            );
            
            if (!messageExists) {
                return { messages: [...state.messages, newMessage] };
            }
            return state;
        });
    },
}))