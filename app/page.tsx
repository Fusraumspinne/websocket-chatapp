"use client";

import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import LogoutIcon from '@mui/icons-material/Logout';

// Reaktionen auf Nachrichten

// Account
// Bisher genutze Rooms werden gespeichert
// Private Nachrichten

// Verschlüsselung der Nachrichten

export default function Home() {
  const router = useRouter();
  const [socket, setSocket] = useState<any>(undefined);

  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  const [joined, setJoined] = useState<boolean>(false);
  const [showRooms, setShowRooms] = useState<boolean>(false);
  const [autoJoin, setAutoJoin] = useState<boolean>(false);

  const [roomName, setRoomName] = useState<string>("");

  const userName = useUserStore((state) => state.userName);
  const setUserName = useUserStore((state) => state.setUserName);

  const [roomsList, setRoomsList] = useState<any>({});
  const [currentRoomUsers, setCurrentRoomUsers] = useState<string[]>([]);

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
    setJoined(true);
    router.push(`/chat/${encodeURIComponent(roomName)}`);
  };

  useEffect(() => {
    if (!socket) {
      const SERVER_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://websocket-chatapp-server.onrender.com";

      const newSocket = io(SERVER_URL);

      newSocket.on("roomsList", (rooms) => {
        setRoomsList(rooms);
        setSocketConnected(true);
      });

      setSocket(newSocket);
    } else {
      socket.emit("getRooms");
    }
  }, [socket]);

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

  return (
    <div className="flex md:mt-16 mt-12 jusify-center w-full">
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
        ) : socketConnected ? (
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
                      Room: {room}
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
            <div className="w-64 my-2">
              <div className="border rounded-lg border-gray-300"></div>
              <h1 className="text-lg font-bold text-gray-700">Popular Rooms</h1>
              <div
                onClick={() => joinRoomFunction("GoofyPictures")}
                className="cursor-pointer"
              >
                <h1 className="text-base font-semibold underline text-gray-700">
                  GoofyPictures
                </h1>                
              </div>

              <div
                onClick={() => joinRoomFunction("MainChannel")}
                className="cursor-pointer"
              >
                <h1 className="text-base font-semibold underline text-gray-700">
                  MainChannel
                </h1>                
              </div>
            </div>
            <button
              className="w-64 px-4 py-2 text-white bg-blue-500 rounded-lg md:mt-4 mt-2"
              onClick={() => setShowRooms(false)}
            >
              Back
            </button>
          </>
        ) : (
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-700">
              Connecting to server...
            </h1>
            <p className="text-sm text-gray-500">Please wait</p>
          </div>
        )}
      </div>
    </div>
  );
}
