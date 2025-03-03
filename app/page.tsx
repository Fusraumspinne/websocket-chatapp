"use client";

import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatForm from "@/components/ChatForm";
import { v4 as uuidv4 } from "uuid";
import { set } from "mongoose";

//Reaktionen auf Nachrichten
//Suchfunktion für Nachrichten
//Verschlüsselung der Nachrichten
//Slow-Modus 5 Sekunden pro Nachricht
//Automatische Warnungen oder Timeouts bei Spam oder bösen Wörtern

export default function Home() {
  const [socket, setSocket] = useState<any>(undefined);

  const [joined, setJoinded] = useState<boolean>(false);
  const [showRooms, setShowRooms] = useState<boolean>(false);
  const [autoJoin, setAutoJoin] = useState<boolean>(false);

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<any>([]);

  const [roomName, setRoomName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const [roomsList, setRoomsList] = useState<any>({});
  const [currentRoomUsers, setCurrentRoomUsers] = useState<string[]>([]);

  const [editMessageID, setEditMessageID] = useState<string>("");

  const chatEndRef = useRef<any>(null);
  const userNameRef = useRef(userName);
  let typingTimeout: NodeJS.Timeout | null = null;

  const joinRoomFunction = (room: string) => {
    if (userName.length > 10) {
      alert("Username cannot be longer than 10 characters");
      return;
    }

    if (room) {
      setRoomName(room);
      if (room.length && userName.length) {
        setAutoJoin(true);
      }
    } else {
      if (roomName.length && userName.length) {
        handleJoinRoom();
      }
    }
  };

  const handleJoinRoom = () => {
    setShowRooms(false);
    localStorage.setItem("Username", userName);
    setJoinded(true);
    const timestamp = getDate();
    socket.emit("joinRoom", roomName, userName, timestamp);
    getPrevMessages();
  };

  const handleLeaveRoom = () => {
    const timestamp = getDate();
    socket.emit("leaveRoom", roomName, userName, timestamp);
    setJoinded(false);
    setMessages([]);
    setRoomName("");
    setCurrentRoomUsers([]);
    socket.emit("getRooms");
  };

  const getPrevMessages = async () => {
    try {
      const resPrevMessages = await fetch("/api/getMessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
        }),
      });

      if (resPrevMessages.ok) {
        const data = await resPrevMessages.json();
        setMessages((prevMessages: any) => [...prevMessages, ...data.messages]);
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
          prevMessages.map(
            (msg: any) =>
              msg.id === messageObject.id ? { ...msg, message: messageObject.message, edited: true } : msg,
          )
        );
      });

      newSocket.on("roomUsers", (users) => {
        setCurrentRoomUsers(users);
      });

      newSocket.on("roomsList", (rooms) => {
        setRoomsList(rooms);
      });

      newSocket.on("typingUsers", (users) => {
        const filteredUsers = users.filter(
          (user: string) => user !== userNameRef.current
        );
        setTypingUsers(filteredUsers);
      });

      setSocket(newSocket);
    } else {
      socket.emit("getRooms");
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

  const handleKeyPressRoom = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      joinRoomFunction("");
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem("Username") || "");
  }, []);

  useEffect(() => {
    if (autoJoin) {
      handleJoinRoom();
      setAutoJoin(false);
    }
  }, [autoJoin]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  return (
    <div className="flex md:mt-24 mt-12 jusify-center w-full">
      {!joined ? (
        <div className="flex w-full max-w-3xl mx-auto flex-col items-center">
          {!showRooms ? (
            <>
              <h1 className="md:mb-4 mb-2 text-2xl font-bold text-gray-700">
                Join a Room
              </h1>
              <input
                placeholder="Enter a username..."
                onKeyDown={handleKeyPressRoom}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                type="text"
                name="message"
                className="w-64 px-4 py-2 md:mb-4 mb-2 border-2 rounded-lg border-gray-300 focus:outline-none"
              />
              <input
                placeholder="Enter a room..."
                onKeyDown={handleKeyPressRoom}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                type="text"
                name="message"
                className="w-64 px-4 py-2 md:mb-4 mb-2 border-2 rounded-lg border-gray-300 focus:outline-none"
              />
              <button
                className="w-64 px-4 py-2 text-white bg-green-500 rounded-lg"
                onClick={() => joinRoomFunction("")}
              >
                Join Room
              </button>
              <button
                className="w-64 px-4 py-2 text-white bg-blue-500 rounded-lg  md:mt-4 mt-2"
                onClick={() => setShowRooms(true)}
              >
                Show Rooms
              </button>
            </>
          ) : (
            <>
              <h1 className="md:mb-4 mb-2 text-2xl font-bold text-gray-700">
                Open Rooms
              </h1>
              <ul className="border-2 rounded-lg border-gray-300 w-64 p-1">
                {roomsList && Object.keys(roomsList).length > 0 ? (
                  Object.keys(roomsList).map((room, index) => (
                    <li
                      key={index}
                      onClick={() => joinRoomFunction(room)}
                      className="cursor-pointer"
                    >
                      <h1 className="text-lg font-semibold underline text-gray-700">
                        Raum: {room}
                      </h1>
                      <h2 className="text-base text-gray-600">Users:</h2>
                      <ul className="flex flex-wrap">
                        {roomsList[room]?.users?.length > 0 ? (
                          roomsList[room].users.map(
                            (user: string, userIndex: number) => (
                              <li
                                className="text-sm text-gray-600 me-1"
                                key={userIndex}
                              >
                                {user}
                                {userIndex < roomsList[room]?.users.length - 1
                                  ? ","
                                  : ""}
                              </li>
                            )
                          )
                        ) : (
                          <li className="text-sm text-gray-500">
                            No users in this room
                          </li>
                        )}
                      </ul>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No open rooms</p>
                )}
              </ul>
              <button
                className="w-64 px-4 py-2 text-white bg-blue-500 rounded-lg md:mt-4 mt-2"
                onClick={() => setShowRooms(false)}
              >
                Back
              </button>
            </>
          )}
        </div>
      ) : (
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

          <div className="md:h-[500px] h-[300px] overflow-y-auto p-4 bg-gray-200 border-2 rounded-lg border-gray-300 no-scrollbar">
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
            className="w-full px-4 py-2 text-white bg-red-500 rounded-lg md:mt-4 mt-2"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </button>
        </div>
      )}
    </div>
  );
}
