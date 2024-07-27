import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import { apiClient } from '@/lib/api-client';
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTE } from '@/utils/constants';

import { Button } from '@/components/ui/button';
import MultipleSelector from '@/components/ui/multipleselect';

export default function CreateChannel() {
  const [openNewChannelModal, setopenNewChannelModal, addChannel] =
    useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState('');

  useEffect(() => {
    const getData = async () => {
      const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE, {
        withCredentials: true,
      });
      setAllContacts(response?.data?.contacts);
    };
    getData();
  }, []);

  async function createChannel() {
    try {
      if (channelName && selectedContacts?.length > 0) {
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTE,
          {
            name: channelName,
            members: selectedContacts.map((contact) => contact.value),
          },
          { withCredentials: true }
        );
        if (response?.status === 201) {
          setChannelName('');
          setSelectedContacts([]);
          setopenNewChannelModal(false);
          addChannel(response.data.channel);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className='text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300'
              onClick={() => setopenNewChannelModal(true)}
            />
          </TooltipTrigger>
          <TooltipContent
            className={'bg-[#1c1e1b] border-none mb-2 p-3 text-white'}
          >
            <p>Select New Channle</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={openNewChannelModal} onOpenChange={setopenNewChannelModal}>
        <DialogContent className='bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col'>
          <DialogHeader>
            <DialogTitle>
              {' '}
              Please fill up the details for new channel
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <input
              placeholder='Channel Name'
              className='rounded-lg p-6 bg-[#2c2e3b] border-none w-full'
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>
          <div>
            <MultipleSelector
              className='rounded-lg bg-[#2c2e3b] border-none py-2 text-white'
              defaultOptions={allContacts}
              placeholder='Search contacts'
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={
                <p className='text-center text-lg leading-10 text-gray-600'>
                  No results found.
                </p>
              }
            />
          </div>
          <div>
            <Button
              className='w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300'
              onClick={createChannel}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
