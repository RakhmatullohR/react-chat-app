import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES_ROUTE,
  HOST,
} from '@/utils/constants';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { MdFolderZip } from 'react-icons/md';
import { IoMdArrowRoundDown } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { getColor } from '@/utils/colors';

export default function MessageContainer() {
  const scrollRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    setIsDownloading,
    setFileDownloadProgress,
    userInfo,
  } = useAppStore();
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData?._id },
          { withCredentials: true }
        );
        if (response?.data?.messages) {
          setSelectedChatMessages(response?.data?.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData?._id}`,
          { withCredentials: true }
        );
        if (response?.data?.messages) {
          setSelectedChatMessages(response?.data?.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData?._id) {
      if (selectedChatType === 'contact') {
        getMessages();
      }
      if (selectedChatType === 'channel') {
        getChannelMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChatMessages]);

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, i) => {
      const messageDate = moment(message.timestamp).format('YYYY-MM-DD');
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={i}>
          {showDate ? (
            <div className='text-center text-gray-500 my-2'>
              {moment(message.timestamp).format('LL')}
            </div>
          ) : null}
          {selectedChatType === 'contact' ? renderDMMessages(message) : null}
          {selectedChatType === 'channel'
            ? renderChannelMessages(message)
            : null}
        </div>
      );
    });
  };

  const downloadFile = async (fileUrl) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const response = await apiClient.get(`${HOST}/${fileUrl}`, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent || {};
        const percentCompleted = Math.round((100 * loaded) / total);
        setFileDownloadProgress(percentCompleted);
      },
    });
    const urlBlob = window.URL.createObjectURL(new Blob([response?.data]));
    const link = document.createElement('a');
    link.href = urlBlob;
    link.setAttribute('download', fileUrl?.split('/').pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);

    setIsDownloading(false);
    setFileDownloadProgress(0);
  };
  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };
  const renderDMMessages = (message) => {
    return (
      <div
        className={`${
          message?.sender === selectedChatData?._id ? 'text-left' : 'text-right'
        }`}
      >
        {message?.messageType === 'text' ? (
          <div
            className={`${
              message?.sender !== selectedChatData?._id
                ? 'bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/5'
                : 'bg-[#2a2b33]/5 text-white/80 border-[#fff]/20'
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {message?.content}
          </div>
        ) : null}
        {message?.messageType === 'file' ? (
          <div
            className={`${
              message?.sender !== selectedChatData?._id
                ? 'bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/5'
                : 'bg-[#2a2b33]/5 text-white/80 border-[#fff]/20'
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message?.fileUrl) ? (
              <div
                className='cursor-pointer'
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message?.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message?.fileUrl}`}
                  width={300}
                  height={300}
                />
              </div>
            ) : (
              <div className='flex items-center justify-center gap-4'>
                <span className='text-white/80 text-3xl bg-black/20 rounded-full p-3'>
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split('/').pop()}</span>
                <span
                  className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
                  onClick={() => downloadFile(message?.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        ) : null}

        <div className='text-xs text-gray-600'>
          {moment(message?.timestamp).format('LT')}
        </div>
      </div>
    );
  };
  const renderChannelMessages = (message) => (
    <div
      className={`mt-5 ${
        message?.sender?._id !== userInfo?.id ? 'text-left' : 'text-right'
      }`}
    >
      {message?.messageType === 'text' ? (
        <div
          className={`${
            message?.sender?._id === userInfo?.id
              ? 'bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/5'
              : 'bg-[#2a2b33]/5 text-white/80 border-[#fff]/20'
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {message?.content}
        </div>
      ) : null}
      {message?.messageType === 'file' ? (
        <div
          className={`${
            message?.sender?._id === userInfo?.id
              ? 'bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/5'
              : 'bg-[#2a2b33]/5 text-white/80 border-[#fff]/20'
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {checkIfImage(message?.fileUrl) ? (
            <div
              className='cursor-pointer'
              onClick={() => {
                setShowImage(true);
                setImageURL(message?.fileUrl);
              }}
            >
              <img
                src={`${HOST}/${message?.fileUrl}`}
                width={300}
                height={300}
              />
            </div>
          ) : (
            <div className='flex items-center justify-center gap-4'>
              <span className='text-white/80 text-3xl bg-black/20 rounded-full p-3'>
                <MdFolderZip />
              </span>
              <span>{message.fileUrl.split('/').pop()}</span>
              <span
                className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
                onClick={() => downloadFile(message?.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      ) : null}
      <div
        className={`text-xs text-gray-600 flex ${
          message?.sender?._id === userInfo?.id
            ? 'justify-start flex-row-reverse'
            : 'justify-start'
        }  gap-2`}
      >
        <Avatar
          className='h-8 w-8 rounded-full overflow-hidden'
          title={`${message?.sender.firstName} ${message?.sender.lastName}`}
        >
          {message?.sender?.image ? (
            <AvatarImage
              src={`${HOST}/${message?.sender?.image}`}
              alt='profile'
              className='object-cover w-full h-full bg-black'
            />
          ) : (
            <div
              className={`uppercase w-8 h-8 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                message?.sender.color
              )}`}
            >
              {/* bosh harfni o'rtaga chiqarish uchun */}
              {message?.sender?.firstName
                ? message?.sender?.firstName.split('').shift()
                : message?.sender?.email.split('').shift()}
            </div>
          )}
        </Avatar>
        <div>{moment(message?.timestamp).format('LT')}</div>
      </div>
    </div>
  );

  return (
    <div className='flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full'>
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage ? (
        <div className='fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col'>
          <div>
            <img
              src={`${HOST}/${imageURL}`}
              className='h-[80vh] w-full bg-cover'
            />
          </div>
          <div className='flex gap-5 fixed top-5 mt-3'>
            <button
              className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
              onClick={() => {
                downloadFile(imageURL);
              }}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
