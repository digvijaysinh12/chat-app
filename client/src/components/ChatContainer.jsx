import React, { useEffect, useRef } from 'react';
import assets, { messagesDummyData } from '../assets/assets';

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const loggedInUserId = '680f5116f10f3cd28382ed02'; // Assuming this is the logged-in user (you can make it dynamic later)

  // Filter messages relevant to selected user
  const relevantMessages = messagesDummyData.filter(
    (msg) =>
      (msg.senderId === loggedInUserId && msg.receiverId === selectedUser?._id) ||
      (msg.receiverId === loggedInUserId && msg.senderId === selectedUser?._id)
  );
  
  const scrollEnd = useRef()

  useEffect(() =>{
    if(scrollEnd.current){
      scrollEnd.current.scrollIntoView();
    }
  },[])
  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop:backdrop-blur-lg'>

      {/* ---- header ---- */}
      <div className='flex flex-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt='' className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          <span className='w-2 h-2 rounded-full bg-green-500'></span>
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=''
          className='md:hidden max-w-7 cursor-pointer'
        />
        <img src={assets.help_icon} alt='' className='max-md:hidden max-w-5' />
      </div>

      {/* ---- chat area ---- */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {relevantMessages.length > 0 ? (
          relevantMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${msg.senderId === loggedInUserId ? 'justify-end' : 'justify-start'}`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=''
                  className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                    msg.senderId === loggedInUserId ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <div className='text-center text-xs'>
                <img
                  src={
                    msg.senderId === loggedInUserId
                      ? assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  alt=''
                  className='w-7 rounded-full'
                />
                <p className='text-gray-500'>{new Date(msg.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className='text-gray-400 text-sm text-center mt-4'>No messages yet.</p>
        )}
        <div ref={scrollEnd}></div>
      </div>

    {/* ---- bottom area ---- */}
    <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input type='text' placeholder='Send a message' 
          className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'/>
          <input type='file' id='image' accept='image/png, image/jpeg' hidden/>
          <label htmlFor='image'>
            <img src={assets.gallery_icon} alt='' className='w-5 mr-2 cursor-pointer'/>
          </label>
        </div>
        <img src={assets.send_button} alt='' className='w-7 cursor-pointer'/>
    </div>
 
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} className='max-w-16' alt='' />
      <p className='text-lg font-medium text-white'>Chat Anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
