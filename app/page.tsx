"use client";

import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import LogoutIcon from "@mui/icons-material/Logout";

// Reaktionen auf Nachrichten
// Beim löschen wird auch das bild aus dropbox gelöscht

// Account
// Bisher genutze Rooms werden gespeichert
// Private Nachrichten

// DevDashboard
// -> alle nachrichten/nutzer/räume sehen kann
// -> alles bearbeiten und löschen
// -> sytstem nachrichten die in allen rooms angezeigt werden
// -> Nach nutzern und räumen filtern
// Verschlüsselung der Nachrichten

export default function Home() {
  const router = useRouter();
  const [socket, setSocket] = useState<any>(undefined);

  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  const [showRooms, setShowRooms] = useState<boolean>(false);
  const [autoJoin, setAutoJoin] = useState<boolean>(false);

  const [roomName, setRoomName] = useState<string>("");

  const userName = useUserStore((state) => state.userName);
  const setUserName = useUserStore((state) => state.setUserName);

  const [roomsList, setRoomsList] = useState<any>({});

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
    <div className="flex justify-center">
      <div className="flex mt-14 jusify-center custom-blur border-2 custom-border rounded-2xl px-3 py-3">
        <div className="flex mx-auto flex-col items-center">
          {!showRooms ? (
            <>
              <h1 className="mb-3 text-2xl font-bold text-white">
                Join a Room
              </h1>
              <input
                placeholder="Enter a username..."
                onKeyDown={handleKeyPressRoom}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                type="text"
                name="message"
                className="w-64 px-4 py-2 mb-2 text-white placeholder-white custom-blur border-2 custom-border rounded-2xl focus:outline-none"
              />
              <input
                placeholder="Enter a room..."
                onKeyDown={handleKeyPressRoom}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                type="text"
                name="message"
                className="w-64 px-4 py-2 text-white placeholder-white custom-blur border-2 custom-border rounded-2xl focus:outline-none"
              />
              <div className="custom-blur border custom-border w-64 my-3"></div>
              <button
                className="w-64 px-4 py-2 text-white custom-blur border-2 custom-border mb-2 rounded-2xl"
                onClick={() => joinRoomFunction("")}
              >
                Join Room
              </button>
              <button
                className="w-64 px-4 py-2 text-white custom-blur border-2 custom-border rounded-2xl"
                onClick={() => setShowRooms(true)}
              >
                Show Rooms
              </button>
            </>
          ) : socketConnected ? (
            <>
              <h1 className="mb-3 text-2xl font-bold text-white">Open Rooms</h1>
              <ul className="custom-blur border-2 custom-border rounded-2xl w-64 p-3">
                {roomsList && Object.keys(roomsList).length > 0 ? (
                  Object.keys(roomsList).map((room, index, arr) => (
                    <li
                      key={index}
                      onClick={() => joinRoomFunction(room)}
                      className="cursor-pointer"
                    >
                      <h1 className="text-lg font-semibold underline text-white">
                        {room}
                      </h1>
                      <ul className="flex flex-wrap">
                        {roomsList[room]?.users?.length > 0 ? (
                          roomsList[room].users.map(
                            (user: string, userIndex: number) => (
                              <li
                                className="text-sm text-white me-1"
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
                          <li className="text-sm text-white">
                            No users in this room
                          </li>
                        )}
                      </ul>
                      {index < arr.length - 1 && (
                        <div className="custom-blur border custom-border rounded-2xl w-56 my-3"></div>
                      )}
                    </li>
                  ))
                ) : (
                  <p className="text-white text-center">No open rooms</p>
                )}
              </ul>
              <div className="w-64 my-3">
                <div className="custom-blur border custom-border rounded-2xl"></div>
                <h1 className="text-lg font-bold text-white mt-1">
                  Popular Rooms
                </h1>
                <div
                  onClick={() => joinRoomFunction("MainChannel")}
                  className="cursor-pointer"
                >
                  <h1 className="text-base font-semibold underline  text-white">
                    MainChannel
                  </h1>
                </div>
                
                <div
                  onClick={() => joinRoomFunction("GoofyPictures")}
                  className="cursor-pointer"
                >
                  <h1 className="text-base font-semibold underline  text-white">
                    GoofyPictures
                  </h1>
                </div>
              </div>
              <div className="custom-blur border custom-border w-64"></div>
              <button
                className="w-64 px-4 py-2 text-white custom-blur border-2 custom-border rounded-2xl mt-3"
                onClick={() => setShowRooms(false)}
              >
                Back
              </button>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-lg font-semibold  text-white">
                Connecting to server...
              </h1>
              <p className="text-sm text-white">Please wait</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
