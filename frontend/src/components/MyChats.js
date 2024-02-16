import React, { useEffect, useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import { Box, Button, Stack, useToast, Text } from '@chakra-ui/react';
import axios from 'axios';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './miscellaneous/GroupChatModal';

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      console.log(data);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };  

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain])
  

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="3xl"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "24px", md: "26px" }}
        fontFamily="monospace"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center" 
        letterSpacing="widest"
      >
        Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg:"17px" }}
            rightIcon={<AddIcon/>}
          >
            <img width="26" height="26" src="https://img.icons8.com/sf-regular-filled/48/groups.png" alt="groups"/>
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="3xl"
        overflowY="hidden"
        fontFamily="monospace"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#808080" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "balck"}
                px={3}
                py={2}
                borderRadius="2xl"
                key={chat._id}
                _hover={{
                  background: "#808080",
                  color: "white",
                }}
              >
                <Text>
                  {!chat.isGroupChat ? (getSender(loggedUser, chat.users)) : (chat.chatName)}
                </Text>
              </Box>
            ))}
          </Stack>
        ): (
          <ChatLoading/>
        )}

      </Box>
    </Box>
  )
}

export default MyChats