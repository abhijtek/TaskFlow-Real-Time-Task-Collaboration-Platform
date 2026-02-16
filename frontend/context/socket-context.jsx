import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    try {
      const sock = getSocket();
      setSocket(sock);
      
      if (!sock) {
        console.warn("Socket not available (using mock data mode)");
        return;
      }

      function onConnect() { setConnected(true); }
      function onDisconnect() { setConnected(false); }

      sock.on("connect", onConnect);
      sock.on("disconnect", onDisconnect);

      if (sock.connected) setConnected(true);

      return () => {
        sock.off("connect", onConnect);
        sock.off("disconnect", onDisconnect);
      };
    } catch (error) {
      console.warn("Socket initialization failed:", error.message);
      setConnected(false);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
