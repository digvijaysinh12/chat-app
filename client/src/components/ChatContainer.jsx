import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DEBUG = false;

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);

  const scrollEnd = useRef();
  const typingTimeoutRef = useRef(null);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({});

  // Send text message
  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    try {
      DEBUG && console.log('🔹 Sending message:', text);
      await sendMessage({ text });
    } catch (err) {
      DEBUG && console.error('Error sending message:', err);
      toast.error('Failed to send message.');
    }
  };

  // Send image message
  const handleSendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        DEBUG && console.log('🔹 Sending image message');
        await sendMessage({ image: reader.result });
        e.target.value = '';
      } catch (err) {
        DEBUG && console.error('Error sending image:', err);
        toast.error('Failed to send image.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Emit "typing" events
  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);
    if (socket && selectedUser) {
      DEBUG && console.log('🔹 Emitting typing start');
      socket.emit('typing', { toUserId: selectedUser._id, isTyping: true });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        DEBUG && console.log('🔹 Emitting typing stop');
        socket.emit('typing', { toUserId: selectedUser._id, isTyping: false });
      }, 1500);
    }
  };

  // Fetch messages on user select
  useEffect(() => {
    if (selectedUser) {
      DEBUG && console.log('🔹 Fetching messages with', selectedUser._id);
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Scroll to last message
  useEffect(() => {
    if (scrollEnd.current) {
      DEBUG && console.log('🔹 Scrolling to bottom');
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Listen for typing events
  useEffect(() => {
    if (socket) {
      const listener = ({ fromUserId, isTyping }) => {
        DEBUG && console.log(`🔹 Typing event from ${fromUserId}: ${isTyping}`);
        setTypingUsers(prev => ({ ...prev, [fromUserId]: isTyping }));
      };
      socket.on('typing', listener);
      return () => {
        socket.off('typing', listener);
      };
    }
  }, [socket]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="Avatar" className="w-8 rounded-full" />
        <p className="text-lg text-white flex-1 flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500" />}
        </p>
        <img src={assets.arrow_icon} alt="Back" className="md:hidden w-5 cursor-pointer" onClick={() => setSelectedUser(null)} />
        <img src={assets.help_icon} alt="Help" className="hidden md:block w-5" />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-20">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}
          >
            {msg.image ? (
              <img src={msg.image} alt="Sent" className="max-w-[230px] rounded-lg mb-2" />
            ) : (
              <div className="p-3 max-w-[200px] bg-violet-500/30 text-white rounded-lg mb-2">
                <p className="break-all">{msg.text}</p>
                <p className="text-xs mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers[selectedUser._id] && (
          <div className="flex items-end gap-2 justify-start p-2">
            <p className="italic text-white/70 text-xs">Typing...</p>
          </div>
        )}
        <div ref={scrollEnd} />
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-4 bg-gray-900/50">
        <input
          type="text"
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-full outline-none bg-gray-800 text-white"
        />
        <input type="file" id="imgUpload" accept="image/*" hidden onChange={handleSendImage} />
        <label htmlFor="imgUpload" className="cursor-pointer">
          <img src={assets.gallery_icon} alt="Upload" className="w-6" />
        </label>
        <img src={assets.send_button} alt="Send" className="w-6 cursor-pointer" onClick={handleSendMessage} />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white/10">
      <img src={assets.logo_icon} alt="Logo" className="w-24 mb-4" />
      <p className="text-xl text-white">Select a user to start chatting</p>
    </div>
  );
};

export default ChatContainer;
