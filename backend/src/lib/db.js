import mongoose from "mongoose"

export const connectDB=async()=>{
    try {
        const conn= await mongoose.connect(process.env.MONGODB_URL);
        console.log('Mongodb Connection successful '+ conn.connection.host);
        
    } catch (error) {
        console.log("MONGODB ERROR : "+error.message);
        
    }
}