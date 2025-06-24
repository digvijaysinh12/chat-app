import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const Sidebar = () => {
  const {
    getUsers,
    getContacts,
    users,
    contacts,
    selectedUser,
    setSelectedUser,
    unseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? 'max-md:hidden' : ''
      }`}
    >
      {/* Logo and Menu */}
      <div className="pb-5">
        <div className="flex justify-between items-center relative">
          <img src={assets.logo} alt="logo" className="max-w-40" />

          <div className="relative">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
              onClick={() => setMenuOpen(prev => !prev)}
            />

            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 rounded-md bg-[#282142] border border-gray-600 text-gray-100 shadow-lg z-50">
                <p
                  onClick={() => handleNavigate('/profile')}
                  className="cursor-pointer text-sm hover:bg-gray-700 px-3 py-2"
                >
                  Edit Profile
                </p>
                <hr className="my-1 border-t border-gray-500" />
                <p
                  onClick={handleLogout}
                  className="cursor-pointer text-sm hover:bg-gray-700 px-3 py-2"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex items-center gap-2 bg-[#282142] px-3 py-2 rounded-md">
          <img
            src={assets.search_icon}
            alt="Search"
            className="w-4 h-4 opacity-70"
          />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex flex-col">
        {(input.trim() ? filteredUsers : contacts).map((user, index) => (
          <div
            key={user._id || index}
            onClick={() => setSelectedUser(user)}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id ? 'bg-[#282142]/50' : ''
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt=""
              className="w-[35px] aspect-[1/1] rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              <span className={`text-xs ${
                onlineUsers.includes(user._id) ? 'text-green-400' : 'text-neutral-400'
              }`}>
                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
              </span>
            </div>

            {unseenMessages?.[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
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
