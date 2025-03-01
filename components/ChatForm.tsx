"use client";

import React, { useState } from "react";

const ChatForm = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => void;
}) => {
  const [message, setMessage] = useState("");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() !== "") {
        onSendMessage(message);
        setMessage("");
    }
  };

  const handleKeyKeyPressMessage = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 md:mt-4 mt-2">
      <input
        type="text"
        placeholder="Type your message"
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 px-4 border-2 border-gray-300 py-2 rounded-lg focus:outline-none w-full"
        value={message}
      />
      <button type="submit" className="px-4 py-2 rounded-lg text-white bg-blue-500">
        Send
      </button>
    </form>
  );
};

export default ChatForm;