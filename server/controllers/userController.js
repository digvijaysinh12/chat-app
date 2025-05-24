import User from "../models/User.js";



// Signup a new user
export const signup = async(req,res) => {
    const {fullName,email,password,bio} = req.body;

    try{
        if(!fullName || !email || !password || !bio){
            res.json({success:false,message: "Missing Details"})
        }
        const user =  await User.findOne({email});
        if(user){
            res.json({success:false,message: "User already exist"});
        }
        const salt = await bcrypt.getSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
 
        })

        const token = 
    }catch(error){
        console.log(error);
    }
}