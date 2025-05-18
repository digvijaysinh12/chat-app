import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(false);

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%] border border-amber-50">
      <div
        className={`backdrop-blur-xl bg-black/30 border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid relative transition-all duration-300 ${
          selectedUser
            ? 'grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
            : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        <ChatContainer setSelectedUser={setSelectedUser} />
        {selectedUser && <RightSidebar />}
      </div>
    </div>
  );
};

export default HomePage;
