"use client";

import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import LoginIcon from "@mui/icons-material/Login";
import AdminChatForm from "@/components/AdminDashboardComponents/AdminChatForm";
import AdminChatMessage from "@/components/AdminDashboardComponents/AdminChatMessage";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";

// Sehen welch euser gearde online und in welchem chat sind
// typing indikator

export default function AdminDashboard() {
  const router = useRouter();
  const [socket, setSocket] = useState<any>(undefined);

  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  const [messages, setMessages] = useState<any[]>([]);

  const [editMessageID, setEditMessageID] = useState<string>("");
  const [editMessageRoomName, setEditMessageRoomName] = useState<string>("");
  const [editBaseText, setEditBaseText] = useState<string>("");
  const [editImageUrl, setEditImageUrl] = useState<string>("");

  const [allChatWindow, setAllChatWindow] = useState<boolean>(true);
  const [roomsWindow, setRoomsWindow] = useState<boolean>(false);
  const [usersWindow, setUsersWindow] = useState<boolean>(false);

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  const [roomSearch, setRoomSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const chatEndRef = useRef<any>(null);

  const enterDashboard = () => {
    if (passwordInput === "2008") {
      setLoggedIn(true);
      setPasswordInput("");
    }
  };

  const openLiveChat = () => {
    setAllChatWindow(true);
    setRoomsWindow(false);
    setUsersWindow(false);
  };

  const openRooms = () => {
    setAllChatWindow(false);
    setRoomsWindow(true);
    setUsersWindow(false);
  };

  const openUsers = () => {
    setAllChatWindow(false);
    setRoomsWindow(false);
    setUsersWindow(true);
  };

  const handleKeyPressLogin = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      enterDashboard();
    }
  };

  useEffect(() => {
    if (socket) {
      const timestamp = getDate();
      socket.emit("joinRoom", "AdminDashboard", "Admin", timestamp);
      getPrevMessages();
    }
  }, [socket]);

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
    try {
      const resPrevMessages = await fetch("/api/getAllMessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  };

  const parseGermanDate = (dateStr: string) => {
    const [datePart, timePart] = dateStr.split(", ");
    const [day, month, year] = datePart.split(".").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
  };

  const deleteMessage = async (messageId: string, roomName: string) => {
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

  const editMessage = async (
    messageId: string,
    message: string,
    roomName: string
  ) => {
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

    newSocket.on("connect", () => setSocketConnected(true));

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

    newSocket.on("adminMessage", handleAdminMessage);
    newSocket.on("message", handleMessage);
    newSocket.on("deleteMessage", handleDeleteMessage);
    newSocket.on("editMessage", handleEditMessage);

    setSocket(newSocket);

    return () => {
      newSocket.off("adminMessage", handleAdminMessage);
      newSocket.off("message", handleMessage);
      newSocket.off("deleteMessage", handleDeleteMessage);
      newSocket.off("editMessage", handleEditMessage);
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  });

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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

  const filterUsers = () => {
    const users = messages
      .map((msg: any) => msg.userName)
      .filter((name: string) => name && name !== "System");

    return Array.from(new Set(users));
  };

  const filterRooms = () => {
    const rooms = messages
      .map((msg: any) => msg.roomName)
      .filter((name: string) => name && name !== "AdminDashboard");
    return Array.from(new Set(rooms));
  };

  const filteredRooms = filterRooms().filter((room) =>
    room.toLowerCase().includes(roomSearch.toLowerCase())
  );
  const filteredUsers = filterUsers().filter((user) =>
    user.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex justify-center">
      {!loggedIn ? (
        <div className="flex mt-10 jusify-center custom-blur border-2 custom-border rounded-2xl md:p-3 p-2">
          <div className="flex flex-col items-center">
            <h1 className="mb-3 text-2xl font-bold text-white">
              Admin Dashboard
            </h1>
            <div className="flex items-center flex-col md:flex-row">
              {" "}
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-64 px-4 py-2 md:me-2 text-white placeholder-white custom-blur border-2 custom-border rounded-2xl focus:outline-none"
                onKeyDown={handleKeyPressLogin}
              />
              <div className="flex items-center w-full md:mt-0 mt-2">
                <button
                  className="md:w-auto w-full p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
                  onClick={() => enterDashboard()}
                >
                  <LoginIcon />
                </button>
                <button
                  className="md:w-auto w-full ms-2 p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
                  onClick={() => router.push(`/`)}
                >
                  <LogoutIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : socketConnected && dbConnected ? (
        <div className="flex md:w-1/2 w-11/12 mt-10 flex-col border-2 custom-blur custom-border rounded-2xl md:p-3 p-2">
          <div className="flex justify-between items-center w-full">
            <button
              className="w-full p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
              onClick={() => openLiveChat()}
            >
              Chat
            </button>

            <button
              className="md:mx-3 mx-2 w-full p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
              onClick={() => openRooms()}
            >
              Rooms
            </button>

            <button
              className="w-full p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
              onClick={() => openUsers()}
            >
              Users
            </button>
            <button
              className="md:ms-3 ms-2 p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
              onClick={() => router.push(`/`)}
            >
              <LogoutIcon />
            </button>
          </div>
          <div>
            {allChatWindow && (
              <div className="border-2 custom-blur custom-border rounded-2xl md:mt-3 mt-2 md:p-3 p-2">
                <div className="md:h-[450px] h-[300px] overflow-y-auto md:p-3 p-2 text-white border-2 custom-blur custom-border rounded-2xl no-scrollbar">
                  {messages.map((messageObject: any, index: number) => (
                    <AdminChatMessage
                      key={index}
                      id={messageObject.id}
                      sender={messageObject.userName}
                      message={messageObject.message}
                      timestamp={messageObject.timestamp}
                      onDelete={() =>
                        deleteMessage(messageObject.id, messageObject.roomName)
                      }
                      onEdit={() => {
                        setEditMessageID(messageObject.id);
                        setEditMessageRoomName(messageObject.roomName);
                        const imageUrl = extractImageUrl(messageObject.message);
                        setEditImageUrl(imageUrl);
                        setEditBaseText(
                          removeImageUrlFromMessage(messageObject.message)
                        );
                      }}
                      edited={messageObject.edited}
                      response={messageObject.response}
                      roomName={messageObject.roomName}
                    />
                  ))}
                  <div ref={chatEndRef} />
                </div>
                {editMessageID === "" ? (
                  <AdminChatForm isEditing={false} socket={socket} />
                ) : (
                  <AdminChatForm
                    onSendEditedMessage={(message: string) =>
                      editMessage(editMessageID, message, editMessageRoomName)
                    }
                    isEditing={true}
                    initialText={editBaseText}
                    initialImageUrl={editImageUrl}
                    socket={socket}
                  />
                )}
              </div>
            )}

            {roomsWindow && (
              <div className="border-2 custom-blur custom-border rounded-2xl md:mt-3 mt-2 md:p-3 p-2">
                {!selectedRoom ? (
                  <div>
                    <h1 className="text-lg font-semibold text-white">Rooms</h1>
                    <div className="flex items-center">
                      <input
                        placeholder="Search a room..."
                        type="text"
                        className="w-full px-4 py-2 text-white placeholder-white custom-blur border-2 custom-border rounded-2xl focus:outline-none md:mt-3 mt-2"
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                      />
                      <button
                        disabled={true}
                        className="md:mt-3 mt-2 md:ms-3 ms-2 p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
                      >
                        <SearchIcon />
                      </button>
                    </div>
                    <div className="md:mt-3 mt-2 flex flex-col md:h-[410px] h-[260px] overflow-y-auto p-2 text-white border-2 custom-blur custom-border rounded-2xl no-scrollbar">
                      {filteredRooms.length > 0 ? (
                        filteredRooms.map((room) => (
                          <div
                            key={room}
                            onClick={() => setSelectedRoom(room)}
                            className="cursor-pointer"
                          >
                            <h1 className="text-base font-semibold underline text-white">
                              {room}
                            </h1>
                          </div>
                        ))
                      ) : (
                        <div className="text-white">No rooms found</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="md:h-[450px] h-[300px] overflow-y-auto md:p-3 p-2 text-white border-2 custom-blur custom-border rounded-2xl no-scrollbar">
                      {messages
                        .filter((msg: any) => msg.roomName === selectedRoom)
                        .map((messageObject: any, index: number) => (
                          <AdminChatMessage
                            key={index}
                            id={messageObject.id}
                            sender={messageObject.userName}
                            message={messageObject.message}
                            timestamp={messageObject.timestamp}
                            onDelete={() =>
                              deleteMessage(
                                messageObject.id,
                                messageObject.roomName
                              )
                            }
                            onEdit={() => {
                              setEditMessageID(messageObject.id);
                              setEditMessageRoomName(messageObject.roomName);
                              const imageUrl = extractImageUrl(
                                messageObject.message
                              );
                              setEditImageUrl(imageUrl);
                              setEditBaseText(
                                removeImageUrlFromMessage(messageObject.message)
                              );
                            }}
                            edited={messageObject.edited}
                            response={messageObject.response}
                            roomName={messageObject.roomName}
                          />
                        ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="flex">
                      <button
                        className="md:me-3 me-2 md:mt-3 mt-2 p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
                        onClick={() => setSelectedRoom("")}
                      >
                        <ArrowBackIcon />
                      </button>
                      {editMessageID === "" ? (
                        <AdminChatForm
                          isEditing={false}
                          socket={socket}
                          roomName={selectedRoom}
                        />
                      ) : (
                        <AdminChatForm
                          onSendEditedMessage={(message: string) =>
                            editMessage(
                              editMessageID,
                              message,
                              editMessageRoomName
                            )
                          }
                          isEditing={true}
                          initialText={editBaseText}
                          initialImageUrl={editImageUrl}
                          socket={socket}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {usersWindow && (
              <div className="border-2 custom-blur custom-border rounded-2xl md:mt-3 mt-2 md:p-3 p-2">
                {!selectedUser ? (
                  <div>
                    <h1 className="text-lg font-semibold text-white">Users</h1>
                    <div className="flex items-center">
                      <input
                        placeholder="Search a user..."
                        type="text"
                        className="w-full px-4 py-2 text-white placeholder-white custom-blur border-2 custom-border rounded-2xl focus:outline-none md:mt-3 mt-2"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                      <button
                        disabled={true}
                        className="md:mt-3 mt-2 md:ms-3 ms-2 p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
                        onClick={() => setSelectedUser("")}
                      >
                        <SearchIcon />
                      </button>
                    </div>
                    <div className="md:mt-3 mt-2 flex flex-col md:h-[410px] h-[260px] overflow-y-auto p-2 text-white border-2 custom-blur custom-border rounded-2xl no-scrollbar">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <div
                            key={user}
                            onClick={() => setSelectedUser(user)}
                            className="cursor-pointer"
                          >
                            <h1 className="text-base font-semibold underline  text-white">
                              {user}
                            </h1>
                          </div>
                        ))
                      ) : (
                        <div className="text-white">No users found</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="md:h-[450px] h-[300px] overflow-y-auto md:p-3 p-2 text-white border-2 custom-blur custom-border rounded-2xl no-scrollbar">
                      {messages
                        .filter(
                          (messageObject: any) =>
                            messageObject.userName === selectedUser
                        )
                        .map((messageObject: any, index: number) => (
                          <AdminChatMessage
                            key={index}
                            id={messageObject.id}
                            sender={messageObject.userName}
                            message={messageObject.message}
                            timestamp={messageObject.timestamp}
                            onDelete={() =>
                              deleteMessage(
                                messageObject.id,
                                messageObject.roomName
                              )
                            }
                            onEdit={() => {
                              setEditMessageID(messageObject.id);
                              setEditMessageRoomName(messageObject.roomName);
                              const imageUrl = extractImageUrl(
                                messageObject.message
                              );
                              setEditImageUrl(imageUrl);
                              setEditBaseText(
                                removeImageUrlFromMessage(messageObject.message)
                              );
                            }}
                            edited={messageObject.edited}
                            response={messageObject.response}
                            roomName={messageObject.roomName}
                          />
                        ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="flex">
                      <button
                        className="md:me-3 me-2 md:mt-3 mt-2 p-2 text-white custom-blur border-2 custom-border rounded-2xl flex items-center justify-center"
                        onClick={() => setSelectedUser("")}
                      >
                        <ArrowBackIcon />
                      </button>
                      {editMessageID === "" ? (
                        <AdminChatForm
                          isEditing={false}
                          socket={socket}
                          inputDisabled={true}
                          inputPlaceholder="Select a message..."
                        />
                      ) : (
                        <AdminChatForm
                          onSendEditedMessage={(message: string) =>
                            editMessage(
                              editMessageID,
                              message,
                              editMessageRoomName
                            )
                          }
                          isEditing={true}
                          initialText={editBaseText}
                          initialImageUrl={editImageUrl}
                          socket={socket}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-10 text-center custom-blur border-2 custom-border rounded-2xl md:p-3 p-2">
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
  );
}
