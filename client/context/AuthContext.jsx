import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();
const DEBUG = true;

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check if user is authenticated
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
                if (DEBUG) console.log("User authenticated:", data.user);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Send OTP to user's email
    const sendOtp = async (email) => {
        try {
            const { data } = await axios.post("/api/auth/send-otp", { email });
            data.success ? toast.success(data.message || "OTP sent successfully") : toast.error(data.message || "Failed to send OTP");
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
            data.success ? toast.success(data.message || "OTP verified") : toast.error(data.message || "Invalid OTP");
            return data;
        } catch (error) {
            toast.error("OTP verification failed");
            return { success: false };
        }
    };

    // Login user (state = login/register)
const login = async (state, credentials) => {
  try {
    const { data } = await axios.post(`/api/auth/${state}`, credentials);


    if (data.success) {
      setAuthUser(data.userData);
      setToken(data.token);

      // Set token globally for all axios requests
      axios.defaults.headers.common["token"] = data.token;

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Connect to socket server using user data
      connectSocket(data.userData);

      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    toast.error(error.response?.data?.message || error.message);
  }
};


    // Logout user
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;

        if (socket) {
            socket.disconnect();
            setSocket(null);
            if (DEBUG) console.log("Socket disconnected on logout.");
        }

        toast.success("Logged out successfully");
    };

    // Update user profile
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Connect user socket
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

        // Disconnect any existing socket before reconnecting
        if (socket) {
            socket.disconnect();
        }

        const newSocket = io(backendUrl, {
            query: { userId: userData._id },
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            if (DEBUG) console.log("Socket connected:", newSocket.id);
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            if (DEBUG) console.log("Online users received:", userIds);
            setOnlineUsers(userIds);
        });

        newSocket.on("disconnect", () => {
            if (DEBUG) console.log("Socket disconnected.");
        });
    };

    // Set axios header when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }
    }, [token]);

    // Initial auth check on mount
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            if (DEBUG) console.log("Token set on mount:", token);
        }
        checkAuth();

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        };
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
        verifyOtp,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
