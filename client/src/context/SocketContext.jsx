import { useAppStore } from '@/store';
import { HOST } from '@/utils/constants';
import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const {
    userInfo,
    selectedChatData,
    selectedChatType,
    addMessage,
    addChannelInChannelList,
    addContactInDMContacts,
  } = useAppStore();
  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: {
          userId: userInfo?.id,
        },
      });
      socket.current.on('connect', () => {
        console.log('Connected to socket server');
      });

      const handleReceiveMessage = (message) => {
        if (
          selectedChatType !== undefined &&
          (selectedChatData?._id === message.sender?._id ||
            selectedChatData?._id === message.recipient?._id)
        ) {
          addMessage(message);
        }
        addContactInDMContacts(message);
      };
      const handleReceiveChannelMessage = (message) => {
        if (
          selectedChatType !== undefined &&
          selectedChatData?._id === message.channelId
        ) {
          addMessage(message);
        }
        addChannelInChannelList(message);
      };
      socket.current.on('receiveMessage', handleReceiveMessage);
      socket.current.on('recieve-channel-message', handleReceiveChannelMessage);

      return () => {
        socket.current.disconnect();
      };
    }
  }, [
    userInfo,
    selectedChatData,
    selectedChatType,
    addMessage,
    addChannelInChannelList,
    addContactInDMContacts,
  ]);
  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
