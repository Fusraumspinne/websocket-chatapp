"use client";

import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DownloadDoneOutlinedIcon from "@mui/icons-material/DownloadDoneOutlined";
import SendIcon from "@mui/icons-material/Send";
import SyncIcon from "@mui/icons-material/Sync";
import { v4 as uuidv4 } from "uuid";

const ChatForm = ({
  onSendMessage,
  onTyping,
  isEditing,
  responseToMessage,
  onCancelResponse,
  initialText,
  initialImageUrl,
}: {
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  isEditing: boolean;
  responseToMessage?: any | null;
  onCancelResponse?: () => void;
  initialText?: string;
  initialImageUrl?: string;
}) => {
  const [message, setMessage] = useState(initialText || "");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
      setIsUploading(true);
      const formData = new FormData();

      const ext = file.name.split(".").pop();
      const newFileName = `${uuidv4()}.${ext}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      formData.append("file", renamedFile);

      const res = await fetch("/api/uploadFile", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        imageUrl = data.url;
      }

      setFile(null);
      setIsUploading(false);
    }

    if (isEditing) {
      const finalImageUrl = imageUrl || initialImageUrl;
      const combined =
        message.trim() + (finalImageUrl ? `\n${finalImageUrl}` : "");
      onSendMessage(combined);
      setMessage("");
      return;
    }

    if (message.trim() !== "") {
      const combined = message.trim() + (imageUrl ? `\n${imageUrl}` : "");
      onSendMessage(combined);
      setMessage("");
    }
  };

  useEffect(() => {
    if (isEditing) {
      setMessage(initialText || "");
    }
  }, [initialText, isEditing]);

  const addEmoji = (emoji: any) => {
    setMessage((prev) => prev + emoji.native);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col mt-3 relative">
      <div className="flex gap-1">
        <div className="hidden md:block">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((f) => !f)}
            className="px-2 py-2 text-white custom-blur border-2 custom-border rounded-2xl flex justify-center items-center"
          >
            <SentimentSatisfiedAltIcon />
            <span className="sr-only">Emoji Picker</span>
          </button>
        </div>

        <button
          type="button"
          className="px-1 py-1 md:px-2 md:py-2 text-white custom-blur border-2 custom-border rounded-2xl flex justify-center items-center"
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
          placeholder={
            isEditing
              ? "Edit your message"
              : responseToMessage.id !== ""
              ? "Answer that message"
              : "Type your message"
          }
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping();
          }}
          className="flex-1 px-2 text-white placeholder-white custom-blur border-2 custom-border rounded-2xl focus:outline-none w-full"
          value={message}
        />

        <button
          type="submit"
          className="px-1 py-1 md:px-2 md:py-2 text-white custom-blur border-2 custom-border rounded-2xl flex justify-center items-center"
          disabled={isUploading}
        >
          {isUploading ? <SyncIcon className="animate-spin" /> : <SendIcon />}
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
