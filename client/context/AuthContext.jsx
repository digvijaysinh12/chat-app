import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check if user is authenticated
    const checkAuth = async () => {
        try {
            //console.log("Checking user authentication...");
            const { data } = await axios.get("/api/auth/check");
            //console.log("Auth check response:", data);

            if (data.success) {
                setAuthUser(data.user);
                //console.log("User authenticated:", data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            //console.error("Auth check error:", error.message);
            toast.error(error.message);
        }
    };

    // Send OTP to user's email
const sendOtp = async (email) => {
    try {
        const { data } = await axios.post("/api/auth/send-otp", { email });
        if (data.success) {
            toast.success(data.message || "OTP sent successfully");
        } else {
            toast.error(data.message || "Failed to send OTP");
        }
        return data;
    } catch (error) {
        toast.error("Error sending OTP");
        return { success: false };
    }
};

// Verify OTP
const verifyOtp = async ({ email, otp }) => {
    try {
        const { data } = await axios.post("/api/auth/verify-otp", { email, otp });
        if (data.success) {
            toast.success(data.message || "OTP verified");
        } else {
            toast.error(data.message || "Invalid OTP");
        }
        return data;
    } catch (error) {
        toast.error("OTP verification failed");
        return { success: false };
    }
};


    // Login user
    const login = async (state, credentials) => {
        try {
            //console.log(`Attempting ${state} with credentials`, credentials);
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            //console.log(`${state} response:`, data);

            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(`${state} error:`, error.message);
            toast.error(error.message);
        }
    };

    // Logout user
    const logout = async () => {
        console.log("Logging out...");
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        if (socket) {
            socket.disconnect();
            //console.log("Socket disconnected.");
        }
        toast.success("Logged out successfully");
    };

    // Update profile
    const updateProfile = async (body) => {
        try {
            //console.log("Updating profile with body:", body);
            const { data } = await axios.put("/api/auth/update-profile", body);
            //console.log("Profile update response:", data);

            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            console.error("Profile update error:", error.message);
            toast.error(error.message);
        }
    };

    // Connect socket
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) {
            console.log("Socket already connected or userData missing");
            return;
        }
        
        // Disconnect socket that before creating new one
        socket?.disconnect();

        //console.log("Connecting socket for user:", userData._id);
        const newSocket = io(backendUrl, {
            query: { userId: userData._id }
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            //console.log("Socket connected with ID:", newSocket.id);
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            //console.log("Online users:", userIds);
            setOnlineUsers(userIds);
        });

        newSocket.on("disconnect", () => {
            //console.log("Socket disconnected.");
        });
    };

    // On component mount
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            //console.log("Token set in headers:", token);
        }
        checkAuth();
    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        sendOtp,
        verifyOtp
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
