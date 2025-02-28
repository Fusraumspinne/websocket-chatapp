"use client"

import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [socket, setSocket] = useState<any>(undefined)
  const [inbox, setInbox] = useState<any>([])
  const [prevMessages, setPrevMessages] = useState<any>([])
  const [message, setMessage] = useState<string>("")
  const [roomName, setRoomName] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [chatDiv, setChatDiv] = useState<string>("hidden")
  const [roomDiv, setRoomDiv] = useState<string>("block")
  const [roomsList, setRoomsList] = useState<any>({})
  const [currentRoomUsers, setCurrentRoomUsers] = useState<string[]>([])
  const chatEndRef = useRef<any>(null)

  const handleSendMessage = () => {
    socket.emit("message", { userName, message, roomName, timestamp: getDate() })
    saveMessage()
  }

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
          timestamp
        })
      })

      if (resSaveMessage.ok) {
        setMessage("")
      } else {
        console.error("Error while saving message")
      }
    } catch (error) {
      console.error("Error while saving message", error)
    }
  }

  const handleJoinRoom = () => {
    const timestamp = getDate();
    socket.emit("joinRoom", roomName, userName, timestamp);
    getPrevMessages()
  };

  const joinRoomFunction = (room: string) => {
    if (room) {
      setRoomName(room)
      if (roomName.length && userName.length) {
        handleJoinRoom()
        setChatDiv("block")
        setRoomDiv("hidden")
      }
    } else {
      if (roomName.length && userName.length) {
        handleJoinRoom()
        setChatDiv("block")
        setRoomDiv("hidden")
      }
    }
  }

  const handleLeaveRoom = () => {
    const timestamp = getDate()
    socket.emit("leaveRoom", roomName, userName, timestamp)
    setChatDiv("hidden")
    setRoomDiv("block")
    setInbox([])
    setRoomName("")
    setCurrentRoomUsers([])
    socket.emit("getRooms")
  }

  useEffect(() => {
    if (!socket) {
      const newSocket = io("https://websocket-chatapp-server.onrender.com")

      newSocket.on("message", (messageObject) => {
        setInbox((inbox: any) => [...inbox, messageObject])
      })

      newSocket.on("roomUsers", (users) => {
        setCurrentRoomUsers(users)
      })

      newSocket.on("roomsList", (rooms) => {
        setRoomsList(rooms)
      })

      setSocket(newSocket)
    } else {
      socket.emit("getRooms")
    }
  }, [socket])

  const handleKeyKeyPressMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleKeyPressRoom = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      joinRoomFunction("")
    }
  }

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
    setPrevMessages([])

    try {
      const resPrevMessages = await fetch("/api/getMessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName
        })
      })

      if (resPrevMessages.ok) {
        const data = await resPrevMessages.json()
        setPrevMessages(data.messages)
      } else {
        console.error("Error while loading messages")
      }
    } catch (error) {
      console.error("Error while loading messages", error)
    }
  }

  const scrollToBottom = () => {
    chatEndRef.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [prevMessages])

  return (
    <div className="flex flex-col gap-5 mt-20 px-10 ög:px-48">
      <div className={`flex flex-col gap-5 ${chatDiv}`}>
        <div className="flex justify-center border rounded p-2">
          <h1 className="me-5">{`Usernanme: ${userName}`}</h1>
          <h1>{`Room: ${roomName}`}</h1>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-col gap-2 border rounded p-10 no-scrollbar overflow-auto h-96 w-full flex-1">
            {prevMessages.map((messageObject: any, index: number) => (
              <div key={index} className="border rounded px-4 py-2">
                <h1 className={`text-xl ${messageObject.systemClass}`}>{messageObject.userName}</h1>
                <p>{messageObject.message}</p>
                <p className="text-sm">{messageObject.timestamp}</p>
              </div>
            ))}
            {inbox.map((messageObject: any, index: number) => (
              <div key={index} className="border rounded px-4 py-2">
                <h1 className={`text-xl ${messageObject.systemClass}`}>{messageObject.userName}</h1>
                <p>{messageObject.message}</p>
                <p className="text-sm">{messageObject.timestamp}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="w-40 border rounded px-10">
            <h1 className="mt-5 text-xl">Users:</h1>

            <ul>
              {currentRoomUsers.map((user, index) => (
                <li className="text-sm" key={index}>{user}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-2 align-center justify-center">
          <input
            placeholder="Type a message here..."
            onKeyPress={handleKeyKeyPressMessage}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            name="message"
            className="flex-1 border rounded px-2 py-1"
          />
          <button className="w-40 border rounded" onClick={handleSendMessage}>
            Send Message
          </button>
        </div>

        <div className="flex justify-center">
          <button className="w-full bg-red-500 text-white rounded px-2 py-1" onClick={handleLeaveRoom}>
            Leave Room
          </button>
        </div>
      </div>

      <div className={`flex flex-col gap-5 ${roomDiv}`}>
        <div className="flex gap-2 align-center justify-center">
          <input
            placeholder="Type a username here..."
            onKeyPress={handleKeyPressRoom}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            type="text"
            name="message"
            className="flex-1 border rounded px-2 py-1"
          />
        </div>
        <div className="flex gap-2 align-center justify-center">
          <input
            placeholder="Type a room here..."
            onKeyPress={handleKeyPressRoom}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            type="text"
            name="message"
            className="flex-1 border rounded px-2 py-1"
          />
          <button className="w-40 border rounded" onClick={() => joinRoomFunction("")}>
            Join Room
          </button>
        </div>

        <div className="border rounded p-2">
          <h2 className="text-xl">Open Rooms</h2>
          <ul>
            {Object.keys(roomsList).map((room, index) => (
              <li key={index} onClick={() => joinRoomFunction(room)}>
                <h1 className="text-lg">Raum: {room}</h1>
                <h2 className="text-base">Users:</h2>
                <ul>
                  {roomsList[room].users.map((user: string, userIndex: number) => (
                    <li className="text-sm" key={userIndex}>{user}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}