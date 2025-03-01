"use client";

import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatForm from "@/components/ChatForm";

export default function Home() {
  const [socket, setSocket] = useState<any>(undefined);
  const [messages, setMessages] = useState<any>([]);
  const [message, setMessage] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [roomsList, setRoomsList] = useState<any>({});
  const [currentRoomUsers, setCurrentRoomUsers] = useState<string[]>([]);
  const chatEndRef = useRef<any>(null);
  const [joined, setJoinded] = useState<boolean>(false);
  const [showRooms, setShowRooms] = useState<boolean>(false);

  const handleSendMessage = (message: string) => {
    setMessage(message);
    socket.emit("message", {
      userName,
      message,
      roomName,
      timestamp: getDate(),
    });
    saveMessage();
  };

  const saveMessage = async () => {
    const timestamp = getDate();

    try {
      const resSaveMessage = await fetch("/api/saveMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          userName,
          roomName,
          timestamp,
        }),
      });

      if (resSaveMessage.ok) {
        setMessage("");
      } else {
        console.error("Error while saving message");
      }
    } catch (error) {
      console.error("Error while saving message", error);
    }
  };

  const handleJoinRoom = () => {
    setJoinded(true);
    const timestamp = getDate();
    socket.emit("joinRoom", roomName, userName, timestamp);
    getPrevMessages();
  };

  const joinRoomFunction = (room: string) => {
    if (room) {
      setRoomName(room);
      if (roomName.length && userName.length) {
        handleJoinRoom();
      }
    } else {
      if (roomName.length && userName.length) {
        handleJoinRoom();
      }
    }
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

  useEffect(() => {
    if (!socket) {
      const newSocket = io("https://websocket-chatapp-server.onrender.com");

      newSocket.on("message", (messageObject) => {
        setMessages((prevMessages: any) => [...prevMessages, messageObject]);
      });

      newSocket.on("roomUsers", (users) => {
        setCurrentRoomUsers(users);
      });

      newSocket.on("roomsList", (rooms) => {
        setRoomsList(rooms);
      });

      setSocket(newSocket);
    } else {
      socket.emit("getRooms");
    }
  }, [socket]);

  const handleKeyKeyPressMessage = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSendMessage(message);
    }
  };

  const handleKeyPressRoom = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      joinRoomFunction("");
    }
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

  const getPrevMessages = async () => {
    setMessages([]);

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
        setMessages(data.messages);
      } else {
        console.error("Error while loading messages");
      }
    } catch (error) {
      console.error("Error while loading messages", error);
    }
  };

  const scrollToBottom = () => {
    //chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                onKeyPress={handleKeyPressRoom}
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
                    <li key={index} onClick={() => joinRoomFunction(room)}>
                      <h1 className="text-lg font-semibold underline text-gray-700">
                        Raum: {room}
                      </h1>
                      <h2 className="text-base text-gray-600">Users:</h2>
                      <ul>
                        {roomsList[room]?.users?.length > 0 ? (
                          roomsList[room].users.map(
                            (user: string, userIndex: number) => (
                              <li
                                className="text-sm text-gray-600"
                                key={userIndex}
                              >
                                {user}
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
                    {user}{index < arr.length - 1 ? "|" : ""}
                  </li>
                ))}
                {currentRoomUsers.length > 4 && (
                  <li>
                    und {currentRoomUsers.length - 4} mehr
                  </li>
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
              />
            ))}
          </div>

          <ChatForm onSendMessage={handleSendMessage}/>
          <button className="w-full px-4 py-2 text-white bg-red-500 rounded-lg md:mt-4 mt-2" onClick={handleLeaveRoom}>Leave Room</button>
        </div>
      )}
    </div>
  );
}
