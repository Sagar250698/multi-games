import { useEffect, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    socket?.emit(event, data);
  }, [socket]);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback);
  }, [socket]);

  const off = useCallback((event: string) => {
    socket?.off(event);
  }, [socket]);

  return { socket, emit, on, off };
};
