import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import './RightSidebar.css'; // Add this CSS import

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(messages.filter(msg => msg.image).map(msg => msg.image));
  }, [messages]);

  return selectedUser && (
    <div className="right-sidebar">
      {/* Profile */}
      <div className="profile-section">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt={`${selectedUser?.fullName || 'User'}'s profile`}
          className="profile-img"
        />
        <h1 className="profile-name">
          {onlineUsers.includes(selectedUser._id) && <span className="online-dot"></span>}
          {selectedUser.fullName}
        </h1>
        <p className="profile-bio">{selectedUser.bio}</p>
      </div>

      <hr className="divider" />

      {/* Media */}
      <div className="media-section">
        <p className="media-title">Media</p>
        <div className="media-gallery">
          {msgImages.map((url, index) => (
            <div key={index} className="media-item" onClick={() => window.open(url)}>
              <img src={url} alt="media" className="media-img" />
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
