import { io } from "socket.io-client";
// Singleton instance of the socket connection

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000", {
      withCredentials: true,
      autoConnect: false
    });
  }

  return socket;
}
