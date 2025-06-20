import mongoose from "mongoose";

// Function to connect to the mognodb database
export const connectDB = async(req,res) => {
    try{
        mongoose.connection.on('connected',()=> console.log('Database Connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/chatApp`)
    }catch(error){
            res.status({success:false,message:error.message})
    }
}