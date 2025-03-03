"use client";

import React, { useState, useRef, useEffect } from "react";

const ChatForm = ({
  onSendMessage,
  onTyping,
  isEditing
}: {
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  isEditing: boolean;
}) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() !== "") {
        onSendMessage(message);
        setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 md:mt-4 mt-2">
      {isEditing ? (
        <input
        ref={inputRef}
        type="text"
        placeholder="Edit your message"
        onChange={(e) => {
          setMessage(e.target.value);
          onTyping();
        }}
        className="flex-1 px-4 border-2 border-gray-300 py-2 rounded-lg focus:outline-none w-full"
        value={message}
      />
      ) : (
        <input
        type="text"
        placeholder="Type your message"
        onChange={(e) => {
          setMessage(e.target.value);
          onTyping();
        }}
        className="flex-1 px-4 border-2 border-gray-300 py-2 rounded-lg focus:outline-none w-full"
        value={message}
      />
      )}
      
      <button type="submit" className="px-4 py-2 rounded-lg text-white bg-blue-500">
        Send
      </button>
    </form>
  );
};

export default ChatForm;