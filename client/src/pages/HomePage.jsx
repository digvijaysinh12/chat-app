import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../../context/ChatContext';

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen max-h-[800px]">
      <div
        className={`backdrop-blur-xl bg-black/30 border-2 border-gray-600 rounded-2xl overflow-hidden h-full grid relative transition-all duration-300 
          ${selectedUser 
            ? 'grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' 
            : 'grid-cols-1 md:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_3fr]'
          }`}
      >
        <Sidebar />
        <ChatContainer />
        {selectedUser && (
          <RightSidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
