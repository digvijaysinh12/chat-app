import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import './Sidebar.css';

const Sidebar = () => {
  const {
    getUsers,
    getContacts,
    users,
    contacts,
    selectedUser,
    setSelectedUser,
    unseenMessages
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false); // <<== New state
  const navigate = useNavigate();

  const filteredUsers = input
    ? users.filter(user =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : [];

  useEffect(() => {
    getContacts();
  }, [onlineUsers]);

  useEffect(() => {
    if (input.trim()) {
      getUsers();
    }
  }, [input]);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <div className={`sidebar ${selectedUser ? 'hide-on-mobile' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-menu">
          <img src={assets.logo} alt="logo" className="logo" />
          <div className="menu-wrapper">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="menu-icon"
              onClick={toggleMenu}
            />
            {menuOpen && (
              <div className="menu-dropdown">
                <p onClick={() => handleNavigate('/profile')} className="dropdown-item">
                  Edit Profile
                </p>
                <hr className="dropdown-divider" />
                <p onClick={handleLogout} className="dropdown-item">
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="search-bar">
          <img src={assets.search_icon} alt="Search" className="search-icon" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            type="text"
            placeholder="Search User..."
            className="search-input"
          />
        </div>
      </div>

      <div className="user-list">
        {(input.trim() ? filteredUsers : contacts).map((user, index) => (
          <div
            key={user._id || index}
            onClick={() => setSelectedUser(user)}
            className={`user-card ${
              selectedUser?._id === user._id ? 'user-selected' : ''
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt=""
              className="user-avatar"
            />
            <div className="user-info">
              <p>{user.fullName}</p>
              <span className={onlineUsers.includes(user._id) ? 'status-online' : 'status-offline'}>
                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
              </span>
            </div>
            {unseenMessages?.[user._id] > 0 && (
              <p className="unseen-count">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
