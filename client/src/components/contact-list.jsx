import { useAppStore } from '@/store';
import { Avatar, AvatarImage } from './ui/avatar';
import { HOST } from '@/utils/constants';
import { getColor } from '@/utils/colors';

export default function ContactList({ contacts = [], isChannel = false }) {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();
  const handleClick = (contact) => {
    if (isChannel) {
      setSelectedChatType('channel');
    } else {
      setSelectedChatType('contact');
    }

    if (selectedChatData && selectedChatData?._id !== contact?._id) {
      setSelectedChatMessages([]);
    }

    setSelectedChatData(contact);
  };
  return (
    <div className='mt-5 text-left'>
      {contacts?.map((contact) => {
        return (
          <div
            key={contact?._id}
            className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
              selectedChatData && selectedChatData?._id === contact?._id
                ? 'bg-[#8417ff] hover:bg-[#8417ff]'
                : 'hover:bg-[#f1f1f111]'
            }`}
            onClick={() => handleClick(contact)}
          >
            <div className='flex gap-5 items-center justify-start text-neutral-300'>
              {isChannel ? (
                <div className='bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full'>
                  #
                </div>
              ) : (
                <>
                  <Avatar className='h-10 w-10 rounded-full overflow-hidden'>
                    {contact?.image ? (
                      <AvatarImage
                        src={`${HOST}/${contact?.image}`}
                        alt='profile'
                        className='object-cover w-full h-full bg-black'
                      />
                    ) : (
                      <div
                        className={`${
                          selectedChatData &&
                          selectedChatData?._id === contact?._id
                            ? 'bg-[ffffff22] border border-white/70'
                            : getColor(contact.color)
                        } uppercase w-10 h-10 text-lg border-[1px] flex items-center justify-center rounded-full `}
                      >
                        {/* bosh harfni o'rtaga chiqarish uchun */}
                        {contact?.firstName
                          ? contact?.firstName.split('').shift()
                          : contact?.email.split('').shift()}
                      </div>
                    )}
                  </Avatar>
                </>
              )}
              <div>
                {isChannel ? (
                  <span>{contact?.name}</span>
                ) : (
                  <span>
                    {contact?.firstName
                      ? `${contact?.firstName} ${contact?.lastName}`
                      : contact?.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}