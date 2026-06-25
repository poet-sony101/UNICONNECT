import { io } from "socket.io-client";

const socket = io("https://uniconnect-backend-production.up.railway.app", {
  autoConnect: false,
});

export default socket;