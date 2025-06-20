import React, { useState } from "react";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Image from "next/image";
import RateReviewIcon from "@mui/icons-material/RateReview";

interface ChatMessageProps {
  id: string;
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
  id = "",
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
    if (userName !== sender) {
      setResponseMenu(!responseMenu);
    } else {
      setQuickMenu(!quickMenu);
    }
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
    <div
      className={`${isOwnMessage ? "ms-3" : isSystemMessage ? "mx-3" : "me-3"}`}
    >
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
            <div
              className="border-2 custom-border custom-blur rounded-bl-none rounded-br-none rounded-tl-lg border-b-0 rounded-tr-lg p-1"
              onClick={() => {
                const el = document.getElementById(
                  `message-${getResponseId()}`
                );
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  el.classList.add("ring-2", "ring-blue-400", "rounded-lg");
                  setTimeout(
                    () => el.classList.remove("ring-2", "ring-blue-400"),
                    2000
                  );
                }
              }}
            >
              <p className="text-xs md:font-medium font-light text-white">{`-->${getResponseUsername()}`}</p>
              {extractImageUrl(response) && (
                <Image
                  src={extractImageUrl(response)}
                  alt="Image"
                  width={1080}
                  height={1080}
                  className="border custom-border max-w-8 max-h-8 md:max-w-14 md:max-h-14"
                />
              )}
              <p className="text-xs md:font-medium font-light text-white">
                {getResponseMessage().length > 18
                  ? getResponseMessage().slice(0, 18) + "..."
                  : getResponseMessage()}
              </p>{" "}
            </div>
          )}

          <div
            id={`message-${id}`}
            onClick={() => toggleQuickMenu()}
            className={`text-white border-2 custom-border custom-blur ${
              response !== ""
                ? "rounded-tl-none rounded-tr-none rounded-bl-lg rounded-br-lg"
                : "rounded-lg"
            } ${
              isOwnMessage
                ? "rounded-br-none"
                : isSystemMessage
                ? "rounded-lg"
                : "rounded-bl-none"
            } max-w-xs md:px-4 px-2 md:py-2 py-1 ${
              isSystemMessage ? "text-center md:text-xs text-sm" : ""
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
                  className="border-2 custom-border max-w-40 max-h-40 md:max-w-56 md:max-h-56"
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
              <div className="flex flex-col">
                <div className="mt-2 mb-1 custom-blur border custom-border rounded-2xl"></div>
                <div className="flex items-center">
                  <button
                    onClick={(e) => editMessage(e)}
                    className="flex justify-center items-center me-1 w-1/3 px-2 py-1 text-white custom-blur border-2 custom-border rounded-2xl md:mt-2 mt-1"
                  >
                    <EditRoundedIcon style={{ fontSize: "16px" }} />
                  </button>
                  <button
                    onClick={(e) => deleteMessage(e)}
                    className="flex justify-center items-center  w-1/3 px-2 py-1 text-white custom-blur border-2 custom-border rounded-2xl md:mt-2 mt-1"
                  >
                    <DeleteRoundedIcon style={{ fontSize: "16px" }} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickMenu(false);
                    }}
                    className="flex justify-center items-center ms-1 w-1/3 px-2 py-1 text-white custom-blur border-2 custom-border rounded-2xl md:mt-2 mt-1"
                  >
                    <CloseRoundedIcon style={{ fontSize: "16px" }} />
                  </button>
                </div>
              </div>
            )}

            {responseMenu && (
              <div className="flex flex-col">
                <div className="mt-2 mb-1 custom-blur border custom-border rounded-2xl"></div>
                <div className="flex items-center">
                <button
                  onClick={(e) => respondMessage(e)}
                  className="flex justify-center items-center me-1 w-1/2 px-2 py-1 text-white custom-blur border-2 custom-border rounded-2xl md:mt-2 mt-1"
                >
                  <RateReviewIcon style={{ fontSize: "16px" }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setResponseMenu(false);
                  }}
                  className="flex justify-center items-center ms-1 w-1/2 px-2 py-1 text-white custom-blur border-2 custom-border rounded-2xl md:mt-2 mt-1"
                >
                  <CloseRoundedIcon style={{ fontSize: "16px" }} />
                </button>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;