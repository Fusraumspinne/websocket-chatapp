"use client";

import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatForm from "@/components/ChatForm";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";

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
    const messageData = {
      id: messageId,
      userName,
      message,
      roomName,
      timestamp,
      edited: false,
    };
    socket.emit("message", messageData);
    setIsTyping(false);
    socket.emit("stopTyping", { userName, roomName });
    saveMessage(messageData);
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
    if (!socket) {
      //const newSocket = io("http://localhost:3000");
      const newSocket = io("https://websocket-chatapp-server.onrender.com");

      newSocket.on("message", (messageObject) => {
        setMessages((prevMessages: any) => [...prevMessages, messageObject]);
      });

      newSocket.on("deleteMessage", (id: string) => {
        setMessages((prevMessages: any) =>
          prevMessages.filter((message: any) => message.id !== id)
        );
      });

      newSocket.on("editMessage", (messageObject) => {
        setMessages((prevMessages: any) =>
          prevMessages.map((msg: any) =>
            msg.id === messageObject.id
              ? { ...msg, message: messageObject.message, edited: true }
              : msg
          )
        );
      });

      newSocket.on("roomUsers", (users) => {
        setCurrentRoomUsers(users);
        setSocketConnected(true);
      });

      newSocket.on("typingUsers", (users) => {
        const filteredUsers = users.filter(
          (user: string) => user !== userNameRef.current
        );
        setTypingUsers(filteredUsers);
      });

      setSocket(newSocket);
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <div className="flex md:mt-16 mt-12 jusify-center w-full">
      {socketConnected && dbConnected && userName != "" ? (
        <div className="md:w-1/2 w-4/5 mx-auto">
          <div>
            <h1 className="md:mb-4 mb-2 md:text-2xl text-lg font-bold text-gray-700">{`Usernanme: ${userName}`}</h1>
            <div className="flex items-baseline">
              <h1 className="md:mb-4 mb-2 md:text-2xl text-lg font-bold text-gray-700">{`Room: ${roomName}`}</h1>
              <ul className="ms-4 flex">
                {currentRoomUsers.slice(0, 4).map((user, index, arr) => (
                  <li key={index} className="md:text-base text-xs">
                    {user}
                    {index < arr.length - 1 ? "|" : ""}
                  </li>
                ))}
                {currentRoomUsers.length > 4 && (
                  <li>und {currentRoomUsers.length - 4} mehr</li>
                )}
              </ul>
            </div>
          </div>

          <div className="md:h-[450px] h-[300px] overflow-y-auto p-4 bg-gray-200 border-2 rounded-lg border-gray-300 no-scrollbar">
            {messages.map((messageObject: any, index: number) => (
              <ChatMessage
                key={index}
                sender={messageObject.userName}
                message={messageObject.message}
                isOwnMessage={messageObject.userName === userName}
                timestamp={messageObject.timestamp}
                onDelete={() => deleteMessage(messageObject.id)}
                onEdit={() => setEditMessageID(messageObject.id)}
                userName={userName}
                isEditing={editMessageID === messageObject.id}
                edited={messageObject.edited}
              />
            ))}

            <div ref={chatEndRef} />
          </div>

          <div className="text-sm text-gray-500 italic px-2 absolute mt-[-25px]">
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
            />
          ) : (
            <ChatForm
              onSendMessage={(message: string) =>
                editMessage(editMessageID, message)
              }
              onTyping={handleTyping}
              isEditing={true}
            />
          )}

          <button
            className="w-full px-4 py-2 text-white bg-red-500 rounded-lg md:mt-4 my-2"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </button>
        </div>
      ) : (
        <div className="text-center w-full">
          <h1 className="text-lg font-semibold text-gray-700">
            Connecting to
            {!dbConnected && !socketConnected && " database and server..."}
            {!dbConnected && socketConnected && " database..."}
            {dbConnected && !socketConnected && " server..."}
          </h1>
          <p className="text-sm text-gray-500">Please wait</p>
        </div>
      )}
    </div>
  );
}
