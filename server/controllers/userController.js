import User from "../models/User.js";



// Signup a new user
export const signup = async(req,res) => {
    const {fullName,email,password,bio} = req.body;

    try{
        if(!fullName || !email || !password || !bio){
            res.json({success:false,message: "Missing Details"})
        }
        const user =  await User.find
    }catch(error){

    }
}