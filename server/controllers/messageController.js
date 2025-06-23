import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const users = await User.find({ _id: { $ne: userId } }).select("-password");

    const userListWithMeta = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: user._id },
            { senderId: user._id, receiverId: userId }
          ]
        }).sort({ createdAt: -1 });

        const unseenCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false
        });
        return {
          user,
          lastMessage,
          unseenCount,
          lastInteraction: lastMessage?.createdAt || user.createdAt
        };
      })
    );

    // Sort users by last interaction time (most recent first)
    userListWithMeta.sort(
      (a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction)
    );

    res.json({
      success: true,
      users: userListWithMeta.map(({ user, lastMessage, unseenCount }) => ({
        ...user.toObject(),
        lastMessage,
        unseenCount
      }))
    });
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getContactedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("UserId" +userId);

    // Find messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
      
    });
    messages.map(p=> {
      console.log("UserId" +p);
    })

    // Extract unique user IDs that communicated with current user
    const userSet = new Set();

    messages.forEach(msg => {
      if (msg.senderId.toString() !== userId.toString()) {
        userSet.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== userId.toString()) {
        userSet.add(msg.receiverId.toString());
      }
    });

    const contactedUserIds = Array.from(userSet);

    // Fetch user details excluding passwords
    const users = await User.find({ _id: { $in: contactedUserIds } }).select("-password");

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error in getContactedUsers:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//Get all messages for selected User

export const getMessages = async(req,res) => {
    try{
        const {id:selecredUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selecredUserId},
                {senderId: selecredUserId, receiverId: myId},
            ]
        })

        await Message.updateMany({senderId: selecredUserId,receiverId:myId}, {seen: true});
        
        res.json({success: true, messages})
    }catch(error){

        console.log(error.message);
        res.json({success:false, message: "Server Error"})
    }
}


// api to mark message as seen using message id
export const markMessageSeen = async(req,res) => {
    try{
        const {id} = req.params;
        await Message.findByIdAndUpdate(id, {seen:true})
        res.json({success: true})
    }catch(error){
        console.log(error.message);
        res.json({success:false, message: "Server Errror"})
    }
}


// Send message to selected user
export const sendMessage = async(req,res) => {
    try{
        const {text,image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const updloadResponse = await cloudinary.uploader.upload(image);
            imageUrl = updloadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        //Emit the new Message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }
        res.json({success:true, newMessage});
    }catch(error){
        console.log(error.message);
        res.json({success:false, message: "Server Error"})
    }
}