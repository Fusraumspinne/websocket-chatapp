"use client";

import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  const addEmoji = (emoji: any) => {
    setMessage((prev) => prev + emoji.native);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 md:mt-4 mt-2 relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((f) => !f)}
          className="px-4 py-2 rounded-lg text-white bg-blue-500"
        >
          🙂
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder={isEditing ? "Edit your message" : "Type your message"}
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping();
          }}
          className="flex-1 px-4 border-2 border-gray-300 py-2 rounded-lg focus:outline-none w-full"
          value={message}
        />
        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-blue-500">
          Send
        </button>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-16">
          <Picker data={emojiData} onEmojiSelect={addEmoji} />
        </div>
      )}
    </form>
  );
};

export default ChatForm;