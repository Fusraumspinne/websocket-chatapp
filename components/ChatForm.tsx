"use client";

import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DownloadDoneOutlinedIcon from '@mui/icons-material/DownloadDoneOutlined';

const ChatForm = ({
  onSendMessage,
  onTyping,
  isEditing,
}: {
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  isEditing: boolean;
}) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let imageUrl = null;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploadFile", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        imageUrl = data.url;
      }

      setFile(null);
    }

    if (imageUrl && message.trim() === "") {
      onSendMessage(imageUrl);
      setMessage("");
      return;
    }

    if (message.trim() !== "") {
      if (imageUrl) {
        onSendMessage(`${message}\n${imageUrl}`);
      } else {
        onSendMessage(message);
      }
      setMessage("");
    }
  };

  const addEmoji = (emoji: any) => {
    setMessage((prev) => prev + emoji.native);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 md:mt-4 mt-2 relative"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((f) => !f)}
          className="px-4 py-2 rounded-lg text-white bg-blue-500  hidden md:block"
        >
          <SentimentSatisfiedAltIcon />
          <span className="sr-only">Emoji Picker</span>
        </button>

        <button
          type="button"
          className="px-4 py-2 rounded-lg text-white bg-blue-500"
          onClick={() => inputFileRef.current?.click()}
        >
          {file ? <DownloadDoneOutlinedIcon /> : <FileUploadOutlinedIcon />}
          <span className="sr-only">Bild hochladen</span>
        </button>

        <input
          type="file"
          accept="image/*"
          ref={inputFileRef}
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

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

        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-white bg-blue-500"
        >
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
