import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ChatContainer.css';

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);

  const scrollEnd = useRef();
  const typingTimeoutRef = useRef(null);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState({});

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return null;
    setInput('');
    try {
      await sendMessage({ text: input.trim() });
    } catch {
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
      socket.emit('typing', { toUserId: selectedUser._id, isTyping: true });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { toUserId: selectedUser._id, isTyping: false });
      }, 1500);
    }
  };

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView();
    }
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('typing', ({ fromUserId, isTyping }) => {
        setTypingUsers(prev => ({ ...prev, [fromUserId]: isTyping }));
      });
      return () => socket.off('typing');
    }
  }, [socket]);

  if (!selectedUser) {
    return (
      <div className="chat-empty-state">
        <img onClick={handleSendMessage} src={assets.logo_icon} alt="Logo" className="chat-empty-logo" />
        <p className="chat-empty-text">Chat Anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="chat-header-avatar" />
        <p className="chat-header-name">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="online-dot"></span>}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="chat-header-back-icon"
        />
        <img src={assets.help_icon} alt="Help" className="chat-header-help-icon" />
      </div>

      {/* Chat messages */}
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message-row ${msg.senderId === authUser._id ? 'chat-message-right' : 'chat-message-left'}`}
            >
              {msg.image ? (
                <img src={msg.image} alt="sent" className="chat-message-image" />
              ) : (
                <p className={`chat-message-text ${msg.senderId === authUser._id ? 'right-text' : 'left-text'}`}>
                  {msg.text}
                </p>
              )}
              <div className="chat-message-meta">
                <img
                  src={msg.senderId === authUser._id ? authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon}
                  alt="User"
                  className="chat-message-avatar"
                />
                <p className="chat-message-time">{new Date(msg.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-messages">No messages yet.</p>
        )}

        {/* Typing indicator */}
        {typingUsers[selectedUser._id] && (
          <div className={`chat-message-row ${authUser._id === selectedUser._id ? 'chat-message-right' : 'chat-message-left'}`}>
            <div className="typing-indicator">
              <p className="typing-text">Typing...</p>
            </div>
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input area */}
      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <div className="chat-input-wrapper">
          <input
            onChange={handleTyping}
            value={input}
            type="text"
            placeholder="Send a message"
            className="chat-input"
            onKeyDown={e => e.key === 'Enter' ? handleSendMessage(e) : null}
          />
          <input type="file" id="image" accept="image/png, image/jpeg" hidden onChange={handleSendImage} />
          <label htmlFor="image" className="chat-input-label">
            <img src={assets.gallery_icon} alt="Upload" className="chat-upload-icon" />
          </label>
        </div>
        <button type="submit" className="chat-send-button">
          <img src={assets.send_button} alt="Send" />
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
