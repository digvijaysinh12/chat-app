import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);

  const scrollEnd = useRef();
  const typingTimeoutRef = useRef(null);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({}); 

  
const handleSendMessage = async () => {
  if (input.trim() === '') return;
  setInput('');
  try {
    await sendMessage({ text: input.trim() });
  } catch (error) {
    toast.error("Failed to send message.");
  }
};


 
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select an image file');
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  
  const handleTyping = (e) => {
    setInput(e.target.value);

    if (socket && selectedUser) {
      socket.emit('typing', {
        toUserId: selectedUser._id,
        isTyping: true,
      });
     

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          toUserId: selectedUser._id,
          isTyping: false,
        });
      }, 1500);
    }
  };

  // Fetch messages when the selected user changes
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Scroll to the latest message
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView();
    }
  }, [messages]);

  // Listen for typing events from the socket
  useEffect(() => {
    if (socket) {
      socket.on('typing', ({ fromUserId, isTyping }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [fromUserId]: isTyping,
        }));
      });

      return () => socket.off('typing');
    }
  }, [socket]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop:backdrop-blur-lg">
      {/* ---- Header ---- */}
      <div className="flex flex-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      {/* ---- Chat Area ---- */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                />
              ) : (
                <p
                  className={`p-4 max-w-[200px] md:text-lm font-light rounded-lg mb-10 break-all bg-violet-500/30 text-white ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'
                    }`}
                >
                  {msg.text}
                <p className='text-xs'>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
                </p>
              )}

            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center mt-4">No messages yet.</p>
        )}

        {/* Typing indicator */}
        {typingUsers[selectedUser._id] && (
          <div className={`flex items-end gap-2 ${authUser._id === selectedUser._id ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center">
              {/* You can optionally add a small animated typing indicator here */}
              <p className="text-xs italic  bg-violet-500/30 text-white mb-2 ml-1">Typing...</p>
            </div>
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* ---- Bottom Area ---- */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={handleTyping}
            value={input}
            onKeyDown={(e) => e.key === 'Enter' ? handleSendMessage(e) : null}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-7 cursor-pointer" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat Anytime, anywhere</p>
    </div>
  )
};

export default ChatContainer;
