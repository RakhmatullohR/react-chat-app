import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import { UPLOAD_FILE_ROUTE } from '@/utils/constants';
import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef, useState } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
export default function MessageBar() {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
  } = useAppStore();
  const socket = useSocket();
  const [message, setMessage] = useState('');
  const [emojiPickerOpen, setemojiPickerOpen] = useState(false);
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setemojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [emojiRef]);
  function handleAddEmoji(emoji) {
    setMessage((msg) => msg + emoji.emoji);
  }
  async function handleSendMessage() {
    if (selectedChatType === 'contact') {
      socket.emit('sendMessage', {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData?._id,
        messageType: 'text',
        fileUrl: undefined,
      });
    } else if (selectedChatType === 'channel') {
      socket.emit('send-channel-message', {
        sender: userInfo.id,
        content: message,
        messageType: 'text',
        fileUrl: undefined,
        channelId: selectedChatData?._id,
      });
    }
  }
  function handleAttachmentClick() {
    if (fileInputRef?.current) {
      fileInputRef?.current.click();
    }
  }
  async function handleAttachmentChange(event) {
    try {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        setIsUploading(true);
        const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
          withCredentials: true,
          onUploadProgress: (data) => {
            setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
          },
        });
        if (response.status === 200 && response?.data) {
          setIsUploading(false);
          if (selectedChatType === 'contact') {
            socket.emit('sendMessage', {
              sender: userInfo.id,
              content: undefined,
              recipient: selectedChatData?._id,
              messageType: 'file',
              fileUrl: response?.data?.filePath,
            });
          } else if (selectedChatType === 'channel') {
            socket.emit('send-channel-message', {
              sender: userInfo.id,
              content: undefined,
              messageType: 'file',
              fileUrl: response?.data?.filePath,
              channelId: selectedChatData?._id,
            });
          }
        }
      }
    } catch (error) {
      setIsUploading(false);
    }
  }
  return (
    <div className='h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6'>
      <div className='flex flex-1 bg bg-[#2a2b33] rounded-md items-center gap-5 pr-5'>
        <input
          type='text'
          className='flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none'
          placeholder='Enter Message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
          onClick={handleAttachmentClick}
        >
          <GrAttachment className='text-2xl' />
        </button>
        <input
          type='file'
          className='hidden'
          ref={fileInputRef}
          onChange={handleAttachmentChange}
          // accept='.png, .jpg, .jpeg, .svg, .webp, .zip'
        />
        <div className='relative'>
          <button
            className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
            onClick={() => setemojiPickerOpen(true)}
          >
            <RiEmojiStickerLine className='text-2xl' />
          </button>
          <div className='absolute bottom-16 right-0' ref={emojiRef}>
            <EmojiPicker
              theme='dark'
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className='bg-[#8417ff] rounded-md flex items-center justify-center p-5 focus:border-none focus:outline-none hover:bg-[#741bda] focus:bg-[#741bda] focus:text-white duration-300 transition-all'
        onClick={handleSendMessage}
      >
        <IoSend className='text-2xl' />
      </button>
    </div>
  );
}
