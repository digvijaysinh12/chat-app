import React, { useContext, useEffect, useState } from 'react';
import assets, { imagesDummyData } from '../assets/assets';
import { ChatContext } from '../../context/chatContext';
import { AuthContext } from '../../context/AuthContext';

const RightSidebar = () => {

  const {selectedUser, messages} = useContext(ChatContext);
  const {logout, onlineUsers} = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  // Get all the images from the messages and set them to state
  useEffect(() => {
    setMsgImages(
      messages.filter(msg => msg.image).map(msg=>msg.image)
    )
  },[messages])
 
  return selectedUser && (
    <div className="bg-[#8185B2]/10 text-white w-full relative overflow-y-auto max-md:hidden">
      {/* Profile Section */}
      <div className="flex flex-col items-center p-4 gap-2">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt={`${selectedUser?.fullName || 'User'}'s profile`}
          className="w-20 aspect-square rounded-full"
        />
        <h1 className="text-xl font-medium flex items-center gap-2">
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
          {selectedUser.fullName}
        </h1>
        <p className="text-center text-sm text-gray-300">{selectedUser.bio}</p>
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-400/30 my-4" />

      {/* Media Section */}
      <div className="px-5 text-xs">
        <p className="text-white font-semibold">Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-4 opacity-90 pr-2">
          {msgImages.map((url, index) => (
            <div key={index} onClick={() => window.open(url)} className="cursor-pointer">
              <img src={url} alt="media" className="h-full rounded-md object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button onClick={()=> logout()} className="absolute bottom-5 left-1/2 -translate-x-1/2 transform bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-medium py-2 px-8 rounded-full hover:opacity-90 transition">
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
