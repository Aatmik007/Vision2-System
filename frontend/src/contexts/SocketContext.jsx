import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext.jsx';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Connect to the socket server using root/proxy relative paths
      const socketUrl = window.location.origin;
      const socketConn = io(socketUrl, {
        transports: ['websocket', 'polling']
      });

      setSocket(socketConn);

      socketConn.on('connect', () => {
        console.log('Real-time websocket connection established');
      });

      return () => {
        socketConn.disconnect();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
