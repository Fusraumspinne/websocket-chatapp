import React, { useState } from "react";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Image from "next/image";
import RateReviewIcon from '@mui/icons-material/RateReview';

interface ChatMessageProps {
  sender: string;
  message: string;
  isOwnMessage: boolean;
  timestamp: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onRespond?: () => void;
  userName: string;
  isEditing: boolean;
  edited: boolean;
  response: string;
}

const ChatMessage = ({
  sender = "",
  message = "",
  isOwnMessage = false,
  timestamp = "",
  onDelete,
  onEdit,
  onRespond,
  userName = "",
  isEditing = false,
  edited = false,
  response = "",
}: ChatMessageProps) => {
  const isSystemMessage = sender === "System";

  const [quickMenu, setQuickMenu] = useState(false);
  const [responseMenu, setResponseMenu] = useState(false);

  const toggleQuickMenu = () => {
     if (userName !== sender){
      setResponseMenu(!responseMenu);
    } else{
      setQuickMenu(!quickMenu);
    };
  };

  const deleteMessage = (e: any) => {
    if (onDelete) {
      onDelete();
    }
    e.stopPropagation();
    setQuickMenu(false);
  };

  const editMessage = (e: any) => {
    if (onEdit) {
      onEdit();
    }
    e.stopPropagation();
    setQuickMenu(false);
  };

  const respondMessage = (e: any) => {
    if (onRespond) {
      onRespond();
    }
    e.stopPropagation();
    setResponseMenu(false);
  };

  function extractImageUrl(message: string): string {
    const imageRegex = /(https:\/\/dl\.dropboxusercontent\.com[^\s]+)/;
    const match = message.match(imageRegex);
    return match ? match[0] : "";
  }

  function removeImageUrlFromMessage(message: string): string {
    const imageRegex = /(https:\/\/dl\.dropboxusercontent\.com[^\s]+)/;
    return message.replace(imageRegex, "").trim();
  }

  function getResponseId() {
    return response.split(",")[0]?.trim() || "";
  }

  function getResponseUsername() {
    return response.split(",")[1]?.trim() || "";
  }

  function getResponseMessage() {
    return removeImageUrlFromMessage(
      response.split(",").slice(2).join(",").trim() || ""
    );
  }

  return (
    <div>
      <div
        className={`flex ${
          isSystemMessage
            ? "justify-center"
            : isOwnMessage
            ? "justify-end"
            : "justify-start"
        } md:mb-3 mb-1`}
      >
        <div>
          {response !== "" && (
            <div className="border-2  rounded-bl-none rounded-br-none rounded-tl-lg rounded-tr-lg border-gray-300 p-2 bg-gray-300">
              <p className="text-xs md:font-medium font-light">{`-->${getResponseUsername()}`}</p>
              {extractImageUrl(response) && (
                <Image
                  src={extractImageUrl(response)}
                  alt="Image"
                  width={1080}
                  height={1080}
                  className="border rounded-lg border-gray-300 max-w-8 max-h-8 md:max-w-14 md:max-h-14"
                />
              )}
              <p className="text-xs md:font-medium font-light">
                {getResponseMessage().length > 18
                  ? getResponseMessage().slice(0, 18) + "..."
                  : getResponseMessage()}
              </p>{" "}
            </div>
          )}

          <div
            onClick={() => toggleQuickMenu()}
            className={`border-2 ${
              response !== ""
                ? "rounded-tl-none rounded-tr-none rounded-bl-lg rounded-br-lg"
                : "rounded-lg"
            } border-gray-300 max-w-xs md:px-4 px-2 md:py-2 py-1 ${
              isSystemMessage
                ? "bg-gray-800 text-white text-center md:text-xs text-sm"
                : isEditing
                ? "bg-gray-500 text-white"
                : isOwnMessage
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {!isSystemMessage && (
              <p className="md:text-xl text-base md:font-bold font-semibold">
                {sender}
              </p>
            )}

            {extractImageUrl(message) && (
              <div className="mb-2">
                <Image
                  src={extractImageUrl(message)}
                  alt="Image"
                  width={1080}
                  height={1080}
                  className="border-2 rounded-lg border-gray-300 max-w-40 max-h-40 md:max-w-56 md:max-h-56"
                />
              </div>
            )}

            <p className="md:text-base text-xs md:font-normal font-medium">
              {removeImageUrlFromMessage(message)}
            </p>
            <div className="flex">
              <p className="md:text-xs text-xs me-1">{timestamp}</p>
              {edited && <p className="md:text-xs text-xs"> | Edited</p>}
            </div>

            {quickMenu && (
              <div className="flex items-center">
                <button
                  onClick={(e) => editMessage(e)}
                  className="flex justify-center items-center me-1 w-1/3 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"
                >
                  <EditRoundedIcon style={{ fontSize: "16px" }} />
                </button>
                <button
                  onClick={(e) => deleteMessage(e)}
                  className="flex justify-center items-center  w-1/3 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"
                >
                  <DeleteRoundedIcon style={{ fontSize: "16px" }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickMenu(false);
                  }}
                  className="flex justify-center items-center ms-1 w-1/3 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"
                >
                  <CloseRoundedIcon style={{ fontSize: "16px" }} />
                </button>
              </div>
            )}

            {responseMenu && (
              <div className="flex items-center">
                <button
                  onClick={(e) => respondMessage(e)}
                  className="flex justify-center items-center me-1 w-1/2 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"
                >
                  <RateReviewIcon style={{ fontSize: "16px" }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setResponseMenu(false);
                  }}
                  className="flex justify-center items-center ms-1 w-1/2 px-2 py-1 text-black bg-gray-200 border-2 rounded-lg border-gray-300 md:mt-2 mt-1"
                >
                  <CloseRoundedIcon style={{ fontSize: "16px" }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
