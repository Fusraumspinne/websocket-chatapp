"use client";

import React, { useState, useRef, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import { v4 as uuidv4 } from "uuid";

const AdminChatForm = ({
  onSendEditedMessage,
  isEditing = false,
  initialText = "",
  initialImageUrl = "",
  socket = null,
  inputDisabled = false,
  inputPlaceholder = "",
  roomName = "",
}: {
  onSendEditedMessage?: (message: string) => void;
  isEditing: boolean;
  initialText?: string;
  initialImageUrl?: string;
  socket: any;
  inputDisabled?: boolean;
  inputPlaceholder?: string;
  roomName?: string;
}) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isEditing) {
      if (onSendEditedMessage) {
        onSendEditedMessage(message + initialImageUrl);
      }
    } else {
      const messageData = {
        id: uuidv4(),
        message: message,
        userName: "System",
        timestamp: getDate(),
        ...(roomName && { roomName }),
      };

      socket.emit("adminMessage", messageData);
    }

    setMessage("");
  };

  const getDate = () => {
    const now = new Date();
    const formattedDate = now.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return formattedDate;
  };

  useEffect(() => {
    if (isEditing) {
      setMessage(initialText || "");
    }
  }, [initialText, isEditing]);

  return (
    <form onSubmit={handleSubmit} className="flex mt-3 relative w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={
          inputPlaceholder !== ""
            ? inputPlaceholder
            : isEditing
            ? "Edit your message"
            : "Type a system message"
        }
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        className="md:me-3 me-2 flex-1 px-2 text-white placeholder-white custom-blur border-2 custom-border rounded-2xl focus:outline-none w-full"
        value={message}
        disabled={inputDisabled}
      />

      <button
        type="submit"
        className="px-1 py-1 md:px-2 md:py-2 text-white custom-blur border-2 custom-border rounded-2xl flex justify-center items-center"
      >
        <SendIcon />
      </button>
    </form>
  );
};

export default AdminChatForm;
