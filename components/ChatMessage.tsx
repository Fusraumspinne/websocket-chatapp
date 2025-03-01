import React from 'react'

interface ChatMessageProps {
    sender: string;
    message: string;
    isOwnMessage: boolean;
    timestamp: string;
}

const ChatMessage = ({sender, message, isOwnMessage, timestamp} : ChatMessageProps) => {
    const isSystemMessage = sender === 'System';
  return (
    <div className={`flex ${isSystemMessage ? 'justify-center' : isOwnMessage ? 'justify-end' : 'justify-start'} md:mb-3 mb-1`}>
      <div className={`max-w-xs md:px-4 px-2 md:py-2 py-1 rounded-lg ${isSystemMessage ? 'bg-gray-800 text-white text-center md:text-xs text-sm' : isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
        {!isSystemMessage && <p className="md:text-xl text-base md:font-bold font-semibold">{sender}</p>}
        <p className='md:text-base text-xs md:font-normal font-medium'>{message}</p>
        <p className='md:text-xs text-xs'>{timestamp}</p>
      </div>
    </div>
  )
}

export default ChatMessage