import mongoose from "mongoose";

export const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI is not defined in environment variables.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Database Connected Successfully");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

// Mongoose connection events
mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
});
