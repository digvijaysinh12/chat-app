import express from 'express';
import { checkAuth, login, sendOtp, signup, updateProfile, verifyOtp } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();


userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.post("/send-otp",sendOtp);
userRouter.post("/verify-otp",verifyOtp);
userRouter.put("/update-profile",protectRoute,updateProfile);
userRouter.get("/check",protectRoute,checkAuth);

export default userRouter;