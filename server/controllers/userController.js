import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendMail.js";
import Otp from "../models/Otp.js";

// Cookie options (same everywhere)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true in prod (HTTPS), false in dev
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// 1. Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists. Please login." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    await Otp.findOneAndUpdate(
      { email },
      { otp: hashedOtp, expiresAt },
      { upsert: true, new: true }
    );

    await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}. It expires in 10 minutes.`);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "No OTP found for this email" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Delete OTP after successful verification
    await Otp.deleteOne({ email });

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Signup
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (user.password) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.fullName = fullName;
      user.password = hashedPassword;
      await user.save();

      const token = generateToken(user._id);
      res.cookie("token", token, cookieOptions);
      return res.json({ success: true, userData: user, token, message: "Account created successfully" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);
    res.cookie("token", token, cookieOptions);

    res.json({ success: true, userData: newUser, token, message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(400).json({ success: false, message: "You are not signed up yet. Please signup." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);
    res.cookie("token", token, cookieOptions);

    res.json({ success: true, userData, token, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Check Auth
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// 6. Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updatedUser;
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true });
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Logout
export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ success: true, message: "Logged out successfully" });
};
