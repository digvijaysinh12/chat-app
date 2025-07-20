import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from 'bcryptjs'; 
import { sendEmail } from "../utils/sendMail.js";
import Otp from "../models/Otp.js";



export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists (optional, for signup flow)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists. Please login.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    // Upsert OTP record for this email
    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await sendEmail(email, 'Your OTP Code', `Your OTP is ${otp}. It expires in 10 minutes.`);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 2. Verify OTP
// verifyOtp example when OTP stored separately
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }
      await user.save();


    // Optionally delete OTP record after verification
    await Otp.deleteOne({ email });

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {

    res.json({ success: false, message: error.message });
  }
};


// Signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password} = req.body;

  try {
    if (!fullName || !email || !password ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (user) {

      // If user already signed up (password exists), reject
      if (user.password) {
        return res.json({ success: false, message: "User already exists" });
      }
      // If user exists and verified but no password, update user with signup info
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user.fullName = fullName;
      user.password = hashedPassword;

      await user.save();

      const token = generateToken(user._id);
      return res.json({ success: true, userData: user, token, message: "Account created successfully" });
    }

    // If user does not exist (somehow), create new user (unlikely if OTP sent properly)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);

    res.json({ success: true, userData: newUser, token, message: "Account created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};




// Controller to login a user
export const login = async(req,res) => {

    try{
        const { email, password } = req.body;
        const userData = await User.findOne({email})
        if(!userData){
            return res.json({success:false, message: "You are not Signup Yet! Please Signup"})
        }

        const isPasswordCorrect = await  bcrypt.compare(password,userData.password);

        if(!isPasswordCorrect){
            return res.json({success:false, message: "Invalid credentials"});
        }

        const token = generateToken(userData._id)

        res.json({success:true, userData, token, message: "Login successfull"})
    }catch(error){
        res.json({success: false, message: error.message})
    }
}

//Controller to check if user is authenticated
export const checkAuth= (req,res) => {
    res.json({success:true,user:req.user});
}


//Controller to update user profile details 

export const updateProfile = async(req,res) =>{
    try{
        const {profilePic, bio, fullName} = req.body;

        const userId = req.user._id;

        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId,{bio, fullName}, {new:true})
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            
            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new:true})
        }
        res.json({success:true, user: updatedUser})
        
    }catch(error){
        res.json({success:false, message: error.message});
    }
}

