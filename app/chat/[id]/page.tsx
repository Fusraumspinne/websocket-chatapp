"use client";

import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatForm from "@/components/ChatForm";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const roomParam = params.id;
  const [socket, setSocket] = useState<any>(undefined);

  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<any>([]);

  const [roomName, setRoomName] = useState<string>(roomParam);
  const userName = useUserStore((state) => state.userName);

  const [currentRoomUsers, setCurrentRoomUsers] = useState<string[]>([]);

  const [editMessageID, setEditMessageID] = useState<string>("");
  const [responseToMessage, setResponseToMessage] = useState<any | null>({
    id: "",
    userName: "",
    message: "",
  });

  const [editBaseText, setEditBaseText] = useState<string>("");
  const [editImageUrl, setEditImageUrl] = useState<string>("");

  const chatEndRef = useRef<any>(null);
  const userNameRef = useRef(userName);
  let typingTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (userName === "") {
      router.push("/");
    }
  }, [userName, router]);

  useEffect(() => {
    if (socket && userName != "") {
      const timestamp = getDate();
      socket.emit("joinRoom", roomName, userName, timestamp);
      getPrevMessages();
    }
  }, [socket]);

  const getPrevMessages = async () => {
    if (userName != "") {
      try {
        const resPrevMessages = await fetch("/api/getMessages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
          }),
        });

        if (resPrevMessages.ok) {
          setDbConnected(true);
          const data = await resPrevMessages.json();
          setMessages((prevMessages: any) => {
            const allMessages = [...prevMessages, ...data.messages];
            const sortedMessages = allMessages.sort(
              (a: any, b: any) =>
                parseGermanDate(a.timestamp) - parseGermanDate(b.timestamp)
            );
            return sortedMessages;
          });
        } else {
          console.error(
            "Ein Fehler ist beim abrufen der Nachrichten aufgetreten: ",
            resPrevMessages
          );
        }
      } catch (error) {
        console.error(
          "Ein Fehler ist beim abrufen der Nachrichten aufgetreten: ",
          error
        );
      }
    }
  };

  const parseGermanDate = (dateStr: string) => {
    const [datePart, timePart] = dateStr.split(", ");
    const [day, month, year] = datePart.split(".").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
  };

  const handleSendMessage = (message: string) => {
    const messageId = uuidv4();
    const timestamp = getDate();
    let response = "";
    if (responseToMessage) {
      response = [
        responseToMessage.id,
        responseToMessage.userName,
        responseToMessage.message,
      ].join(", ");
    }
    const messageData = {
      id: messageId,
      userName,
      message,
      roomName,
      timestamp,
      edited: false,
      response,
    };

    socket.emit("message", messageData);

    if (message.toLowerCase().includes("nigger")) {
      allMessage(`⚠️${userName} dropped the N-Word⚠️`);
    }
    setIsTyping(false);
    socket.emit("stopTyping", { userName, roomName });
    saveMessage(messageData);
    setResponseToMessage({
      id: "",
      userName: "",
      message: "",
    });
  };

  const saveMessage = async (messageData: any) => {
    try {
      const resSaveMessage = await fetch("/api/saveMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
      if (resSaveMessage.ok) {
        console.log("Nachricht wurde erfolgreich gespeichert");
      } else {
        console.error(
          "Ein Fehler ist beim speichern der Nachricht aufgetreten:",
          resSaveMessage
        );
      }
    } catch (error) {
      console.error(
        "Ein Fehler ist beim speichern der Nachricht aufgetreten: ",
        error
      );
    }
  };

  const deleteMessage = async (messageId: string) => {
    socket.emit("deleteMessage", { roomName, id: messageId });

    try {
      const resDeleteMessage = await fetch("/api/deleteMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: messageId,
        }),
      });

      if (resDeleteMessage.ok) {
        console.log("Nachricht wurde erfolgreich gelöscht");
      } else {
        console.error(
          "Ein Fehler ist beim löschen der Nachricht aufgetreten:",
          resDeleteMessage
        );
      }
    } catch (error) {
      console.error(
        "Ein Fehler ist beim löschen der Nachricht aufgetreten: ",
        error
      );
    }
  };

  const editMessage = async (messageId: string, message: string) => {
    socket.emit("editMessage", { message, roomName, id: messageId });

    try {
      const resEditMessage = await fetch("/api/editMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: messageId,
          newMessage: message,
        }),
      });

      if (resEditMessage.ok) {
        console.log("Nachricht wurde erfolgreich aktualisiert");
      } else {
        console.error(
          "Ein Fehler ist beim aktualisieren der Nachricht aufgetreten:",
          resEditMessage
        );
      }
    } catch (error) {
      console.error(
        "Ein Fehler ist beim aktualisieren der Nachricht aufgetreten: ",
        error
      );
    }

    setEditMessageID("");
  };

  useEffect(() => {
    const SERVER_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://websocket-chatapp-server.onrender.com";

    const newSocket = io(SERVER_URL);

    const handleAdminMessage = (messageObject: any) => {
      setMessages((prevMessages: any) => [...prevMessages, messageObject]);
    };
    const handleMessage = (messageObject: any) => {
      setMessages((prevMessages: any) => [...prevMessages, messageObject]);
    };
    const handleDeleteMessage = (id: string) => {
      setMessages((prevMessages: any) =>
        prevMessages.filter((message: any) => message.id !== id)
      );
    };
    const handleEditMessage = (messageObject: any) => {
      setMessages((prevMessages: any) =>
        prevMessages.map((msg: any) =>
          msg.id === messageObject.id
            ? { ...msg, message: messageObject.message, edited: true }
            : msg
        )
      );
    };
    const handleRoomUsers = (users: string[]) => {
      setCurrentRoomUsers(users);
      setSocketConnected(true);
    };
    const handleTypingUsers = (users: string[]) => {
      const filteredUsers = users.filter(
        (user: string) => user !== userNameRef.current
      );
      setTypingUsers(filteredUsers);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
      router.push("/");
    };

    newSocket.on("adminMessage", handleAdminMessage);
    newSocket.on("message", handleMessage);
    newSocket.on("deleteMessage", handleDeleteMessage);
    newSocket.on("editMessage", handleEditMessage);
    newSocket.on("roomUsers", handleRoomUsers);
    newSocket.on("typingUsers", handleTypingUsers);
    newSocket.on("disconnect", handleDisconnect);

    setSocket(newSocket);

    return () => {
      newSocket.off("adminMessage", handleAdminMessage);
      newSocket.off("message", handleMessage);
      newSocket.off("deleteMessage", handleDeleteMessage);
      newSocket.off("editMessage", handleEditMessage);
      newSocket.off("roomUsers", handleRoomUsers);
      newSocket.off("typingUsers", handleTypingUsers);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.disconnect();
    };
  }, []);

  const handleTyping = () => {
    if (!isTyping && editMessageID === "") {
      setIsTyping(true);
      socket.emit("typing", { userName, roomName });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTyping", { userName, roomName });
    }, 2000);
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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  const handleLeaveRoom = () => {
    const timestamp = getDate();
    socket.emit("leaveRoom", roomName, userName, timestamp);
    router.push("/");
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

  const allMessage = (systemMessage: string) => {
    const messageData = {
      id: uuidv4(),
      message: systemMessage,
      userName: "System",
      timestamp: getDate(),
    };
    socket.emit("adminMessage", messageData);
  };

  return (
    <div className="flex justify-center">
      <div className="flex md:w-1/2 w-11/12 mt-10 justify-center border-2 custom-blur custom-border rounded-2xl md:p-3 p-2">
        {socketConnected && dbConnected && userName != "" ? (
          <div className="w-full">
            <div className="flex justify-between items-end md:mb-3 mb-2">
              <div>
                <div className="flex">
                  <h1 className="md:text-lg text-base font-bold text-white">{`${userName}`}</h1>
                  <h1 className="mx-1 md:text-lg text-base font-bold text-white">
                    |
                  </h1>
                  <h1 className="md:text-lg text-base font-bold text-white">{`${roomName}`}</h1>
                </div>

                <div>
                  <ul className="flex">
                    {currentRoomUsers.slice(0, 3).map((user, index, arr) => (
                      <li key={index} className="md:text-sm text-xs text-white">
                        {user}
                        {index < arr.length - 1 ? "|" : ""}
                      </li>
                    ))}
                    {currentRoomUsers.length > 3 && (
                      <li className="md:text-sm text-xs ms-1 text-white">
                        und {currentRoomUsers.length - 3} mehr
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <div>
                <button
                  className="px-2 py-2 text-white custom-blur border-2 custom-border rounded-2xl flex justify-center items-center"
                  onClick={handleLeaveRoom}
                >
                  <ExitToAppIcon />
                </button>
              </div>
            </div>

            <div className="md:h-[500px] h-[350px] overflow-y-auto md:p-3 p-2 text-white custom-blur border-2 custom-border rounded-2xl no-scrollbar">
              {messages.map((messageObject: any, index: number) => (
                <ChatMessage
                  key={index}
                  id={messageObject.id}
                  sender={messageObject.userName}
                  message={messageObject.message}
                  isOwnMessage={messageObject.userName === userName}
                  timestamp={messageObject.timestamp}
                  onDelete={() => deleteMessage(messageObject.id)}
                  onEdit={() => {
                    setEditMessageID(messageObject.id);
                    const imageUrl = extractImageUrl(messageObject.message);
                    setEditImageUrl(imageUrl);
                    setEditBaseText(
                      removeImageUrlFromMessage(messageObject.message)
                    );
                  }}
                  onRespond={() => setResponseToMessage(messageObject)}
                  userName={userName}
                  edited={messageObject.edited}
                  response={messageObject.response}
                />
              ))}

              <div ref={chatEndRef} />
            </div>

            <div className="text-sm text-white italic md:px-3 px-2 absolute mt-[-25px]">
              {typingUsers.length === 1 && `${typingUsers[0]} is typing...`}
              {typingUsers.length === 2 &&
                `${typingUsers[0]} and ${typingUsers[1]} are typing...`}
              {typingUsers.length > 2 &&
                `${typingUsers[0]} and ${
                  typingUsers.length - 1
                } more are typing...`}
            </div>

            {editMessageID === "" ? (
              <ChatForm
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                isEditing={false}
                responseToMessage={responseToMessage}
                onCancelResponse={() => setResponseToMessage(null)}
              />
            ) : (
              <ChatForm
                onSendMessage={(message: string) =>
                  editMessage(editMessageID, message)
                }
                onTyping={handleTyping}
                isEditing={true}
                responseToMessage={responseToMessage}
                onCancelResponse={() => setResponseToMessage(null)}
                initialText={editBaseText}
                initialImageUrl={editImageUrl}
              />
            )}
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white">
              Connecting to
              {!dbConnected && !socketConnected && " database and server..."}
              {!dbConnected && socketConnected && " database..."}
              {dbConnected && !socketConnected && " server..."}
            </h1>
            <p className="text-sm text-white">Please wait</p>
          </div>
        )}
      </div>
    </div>
  );
}
