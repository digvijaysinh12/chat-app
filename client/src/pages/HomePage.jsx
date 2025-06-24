import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../../context/ChatContext';
import './HomePage.css'; // External CSS

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useContext(ChatContext);

  return (
    <div className="homepage-wrapper">
      <div
        className={`homepage-container ${selectedUser ? 'with-selected-user' : 'no-selected-user'}`}
      >
        <Sidebar />
        <ChatContainer />
        <RightSidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      </div>
    </div>
  );
};

export default HomePage;
