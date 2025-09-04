import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
const audio = new Audio("notification.mp3.mp3");

export const ChatContext = createContext();
const DEBUG = true;

export const ChatProvider = ({ children }) => {
  const typingTimeouts = useRef({});

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // Fetch all sidebar users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Fetch recent contacts
  const getContacts = async () => {
    try {
      const { data } = await axios.get("/api/messages/contacts");
      if (data.success) {
        setContacts(data.users);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Fetch chat messages
  const getMessages = async (userId) => {
    if (!userId) return toast.error("No user selected.");
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
        // Reset unseen count
        setUnseenMessages((prev) => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Send text/image message
  const sendMessage = async (messageData) => {
    if (!selectedUser) return toast.error("No user selected.");
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    }
  };

  // Listen to socket real-time events
  const subscribeToSocketEvents = () => {
    if (!socket ) return;


    socket.on("newMessage", (newMessage) => {
      const isForCurrentChat =
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id);

      if (isForCurrentChat) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
      } else {
        audio.play().catch(() => {});
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    });

    socket.on("typing", ({ fromUserId, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [fromUserId]: isTyping,
      }));

      if (typingTimeouts.current[fromUserId]) {
        clearTimeout(typingTimeouts.current[fromUserId]);
      }

      if (isTyping) {
        typingTimeouts.current[fromUserId] = setTimeout(() => {
          setTypingUsers((prev) => ({
            ...prev,
            [fromUserId]: false,
          }));
          typingTimeouts.current[fromUserId] = null;
        }, 3000);
      }
    });
  };

  const unsubscribeFromSocketEvents = () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("typing");
    }
    Object.values(typingTimeouts.current).forEach(clearTimeout);
    typingTimeouts.current = {};
  };

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      subscribeToSocketEvents();
    };

    const handleDisconnect = () => {
      unsubscribeFromSocketEvents();
    };

    if (socket.connected) {
      subscribeToSocketEvents();
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      unsubscribeFromSocketEvents();
    };
  }, [socket, selectedUser]);

  // Fetch users and contacts after socket connect
  useEffect(() => {
    if (socket && socket.connected) {
      getUsers();
      getContacts();
    }
  }, [socket]);

  // Restore unseen from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("unseenMessages");
    if (saved) {
      setUnseenMessages(JSON.parse(saved));
    }
  }, []);

  // Save unseen to localStorage
  useEffect(() => {
    localStorage.setItem("unseenMessages", JSON.stringify(unseenMessages));
  }, [unseenMessages]);

  // Context Value
  const value = useMemo(
    () => ({
      messages,
      users,
      contacts,
      selectedUser,
      setSelectedUser,
      setMessages,
      sendMessage,
      getMessages,
      getUsers,
      getContacts,
      unseenMessages,
      setUnseenMessages,
      typingUsers,
    }),
    [
      messages,
      users,
      contacts,
      selectedUser,
      unseenMessages,
      typingUsers,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
