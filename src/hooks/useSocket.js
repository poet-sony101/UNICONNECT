import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://uniconnect-backend-production.up.railway.app";

export default function useSocket() {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  return socket;
}