import React from 'react';
import assets from '../assets/assets';

const RightSidebar = ({ selectedUser }) => {
  return selectedUser && (
    <div>
      <div className="flex flex-col items-center text-white p-4 gap-2">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-20 aspect-[1/1] rounded-full"
        />
        <h1 className="text-xl font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {selectedUser.fullName}
        </h1>
        <p className="text-center text-sm text-gray-300">{selectedUser.bio}</p>
      </div>
    </div>
  );
};

export default RightSidebar;
