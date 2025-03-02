import React, { useState } from 'react'
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface ChatMessageProps {
    sender: string;
    message: string;
    isOwnMessage: boolean;
    timestamp: string;
    onDelete?: () => void;
    userName: string;
}

const ChatMessage = ({sender, message, isOwnMessage, timestamp, onDelete, userName} : ChatMessageProps) => {
  const isSystemMessage = sender === 'System';

  const [quickMenu, setQuickMenu] = useState(false);

  const toggleQuickMenu = () => {
    if(userName !== sender) return;
    setQuickMenu(true)
  }

  const deleteMessage = (e: any) => {
    if (onDelete) {
      onDelete();
    }
    e.stopPropagation();
    setQuickMenu(false);
  }

  return (
    <div onClick={() => toggleQuickMenu()}>
      <div className={`flex ${isSystemMessage ? 'justify-center' : isOwnMessage ? 'justify-end' : 'justify-start'} md:mb-3 mb-1`}>
        <div className={`max-w-xs md:px-4 px-2 md:py-2 py-1 rounded-lg ${isSystemMessage ? 'bg-gray-800 text-white text-center md:text-xs text-sm' : isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
          {!isSystemMessage && <p className="md:text-xl text-base md:font-bold font-semibold">{sender}</p>}
          <p className='md:text-base text-xs md:font-normal font-medium'>{message}</p>
          <p className='md:text-xs text-xs'>{timestamp}</p>
          {quickMenu && (
          <div className='flex items-center'>
            <button className="flex justify-center items-center me-1 w-1/3 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"><EditRoundedIcon style={{ fontSize: '16px' }}/></button>
            <button onClick={(e) => deleteMessage(e)} className="flex justify-center items-center  w-1/3 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"><DeleteRoundedIcon  style={{ fontSize: '16px' }}/></button>
            <button onClick={(e) => {e.stopPropagation(); setQuickMenu(false);}}className="flex justify-center items-center ms-1 w-1/3 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"><CloseRoundedIcon  style={{ fontSize: '16px' }}/></button>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage