import express from 'express';
import {
  checkAuth,
  login,
  logout,
  sendOtp,
  signup,
  updateProfile,
  verifyOtp
} from '../controllers/userController.js';

import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

//Public Routes
userRouter.post("/signup", signup);             // Register 
userRouter.post("/login", login);               // Login 
userRouter.post("/send-otp", sendOtp);          // Send OTP 
userRouter.post("/verify-otp", verifyOtp);      // Verify OTP

//Protected Routes(Auth Token)
userRouter.put("/update-profile", protectRoute, updateProfile);  // Update user profile
userRouter.get("/check", protectRoute, checkAuth);               // Check if token is valid
userRouter.post("/logout", protectRoute, logout);

export default userRouter;
