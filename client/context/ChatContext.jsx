import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // Get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      console.log("Error in getUsers:", error.message);
      toast.error(error.message);
    }
  };

  // Get messages for selected user
  const getMessages = async (userId) => {
    try {
      if (!userId) return toast.error("User ID missing.");
      console.log("Fetching messages for user:", userId);
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
        // Reset unseen messages for this user
        setUnseenMessages((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    } catch (error) {
      console.log("Error in getMessages:", error.message);
      toast.error(error.message);
    }
  };

  // Send message to selected user
  const sendMessage = async (messageData) => {
    if (!selectedUser) {
      toast.error("No user selected.");
      return;
    }

    try {
      console.log("Sending message to:", selectedUser._id, messageData);
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error in sendMessage:", error.message);
      toast.error("Error sending message. Please try again");
    }
  };

  // Subscribe to incoming messages and typing events
  const subscribeToMessages = () => {
    if (!socket) {
      return;
    }

    console.log("Subscribing to socket messages...");
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => {
          const updated = { ...prev, [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1 };
          return updated;
        });
      }
    });

    socket.on("typing", ({ fromUserId, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [fromUserId]: isTyping,
      }));

      // Auto-clear typing state after 3 seconds
      if (isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => ({
            ...prev,
            [fromUserId]: false,
          }));
        }, 3000);
      }
    });
  };

  // Unsubscribe from socket messages
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("typing");
    }
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    setMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
    typingUsers,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
