import React, { useState } from 'react'
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Image from 'next/image';

interface ChatMessageProps {
  sender: string;
  message: string;
  isOwnMessage: boolean;
  timestamp: string;
  onDelete?: () => void;
  onEdit?: () => void;
  userName: string;
  isEditing: boolean;
  edited: boolean;
}

const ChatMessage = ({ sender, message, isOwnMessage, timestamp, onDelete, onEdit, userName, isEditing, edited }: ChatMessageProps) => {
  const isSystemMessage = sender === 'System';

  const [quickMenu, setQuickMenu] = useState(false);

  const toggleQuickMenu = () => {
    if (userName !== sender) return;
    setQuickMenu(true)
  }

  const deleteMessage = (e: any) => {
    if (onDelete) {
      onDelete();
    }
    e.stopPropagation();
    setQuickMenu(false);
  }

  const editMessage = (e: any) => {
    if (onEdit) {
      onEdit();
    }
    e.stopPropagation();
    setQuickMenu(false);
  }

  const imageRegex = /(https:\/\/dl\.dropboxusercontent\.com[^\s]+)/;
  const imageMatch = message.match(imageRegex);
  const imageUrl = imageMatch ? imageMatch[0] : "";

  const messageWithoutImage = imageUrl ? message.replace(imageUrl, "").trim() : message;

  return (
    <div>
      <div className={`flex ${isSystemMessage ? 'justify-center' : isOwnMessage ? 'justify-end' : 'justify-start'} md:mb-3 mb-1`}>
        <div onClick={() => toggleQuickMenu()} className={`border-2 rounded-lg border-gray-300 max-w-xs md:px-4 px-2 md:py-2 py-1 ${isSystemMessage ? 'bg-gray-800 text-white text-center md:text-xs text-sm' : isEditing ? 'bg-gray-500 text-white' : isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
          {!isSystemMessage && <p className="md:text-xl text-base md:font-bold font-semibold">{sender}</p>}
          {imageUrl && (
            <div className="mb-2">
              <Image src={imageUrl} alt="Image" width={1080} height={1080} className='border-2 rounded-lg border-gray-300 max-w-40 max-h-40 md:max-w-56 md:max-h-56' />
            </div>
          )}          
          <p className='md:text-base text-xs md:font-normal font-medium'>{messageWithoutImage}</p>
          <div className='flex'>
            <p className='md:text-xs text-xs me-1'>{timestamp}</p>
            {edited && <p className='md:text-xs text-xs'> | Edited</p>}
          </div>
          {quickMenu && (
            <div className='flex items-center'>
              <button onClick={(e) => editMessage(e)} className="flex justify-center items-center me-1 w-1/3 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"><EditRoundedIcon style={{ fontSize: '16px' }} /></button>
              <button onClick={(e) => deleteMessage(e)} className="flex justify-center items-center  w-1/3 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"><DeleteRoundedIcon style={{ fontSize: '16px' }} /></button>
              <button onClick={(e) => { e.stopPropagation(); setQuickMenu(false); }} className="flex justify-center items-center ms-1 w-1/3 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"><CloseRoundedIcon style={{ fontSize: '16px' }} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage