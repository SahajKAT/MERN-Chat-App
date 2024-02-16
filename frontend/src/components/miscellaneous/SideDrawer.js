import axios from "axios";
import { Box, Text } from "@chakra-ui/layout";
import { Avatar, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Tooltip, useToast } from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/button";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
} from '@chakra-ui/react'
import { useDisclosure } from "@chakra-ui/hooks";
import ChatLoading from "../ChatLoading"
import UserListItem from "../UserAvatar/UserListItem"
import { Spinner } from "@chakra-ui/spinner";
import { getSender } from "../../config/ChatLogics";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge";


const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const history  = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();


  const logoutHandler = () => {
    localStorage.removeItem("userInfo");    
    history.push("/");    
  }

  const toast = useToast();

  const handleSearch = async () => {
    if(!search){
      toast({
        title: "Please Enter Something in the Search Bar",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const {data} = await axios.get(`/api/user?search=${search}`, config);
    
      setLoading(false);
      setSearchResult(data);

    } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Search Results",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });     
    }

  }
  
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true)

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
        toast({
          title: "Error fetching the chat",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });     
    }
  }

  return (
  <>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bg="white"
      w="100%"
      p="5px 10px 5px 10px"
      borderWidth="1px"
      borderRadius="full"
    >
      <Tooltip label="" hasArrow placement="bottom-end">
        <Button variant="ghost" onClick={onOpen} borderRadius="full">
          <i class="fas fa-search"></i>
          <Text display={{ base: "none", md: "flex"}} px="4"></Text>
        </Button>
      </Tooltip>

      <Text fontSize="3xl" fontFamily="monospace">
        Quix-Chat
      </Text>
      <div>
        <Menu>
          <MenuButton p={1}>
            <NotificationBadge
              count = {notification.length}
              effect = {Effect.SCALE}
            />
            <BellIcon fontSize="2xl" m={1}/>
          </MenuButton>
            <MenuList fontFamily="monospace" pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map(notif => (
                <MenuItem key={notif._id} onClick={() => {
                  setSelectedChat(notif.chat)
                  setNotification(notification.filter((n) => n !== notif))
                }}>
                  {notif.chat.isGroupChat
                  ? `New Message from ${notif.chat.chatName}`
                  : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} borderRadius="full" >
            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}/>
          </MenuButton>
          <MenuList>
            <ProfileModal user={user}>
              <MenuItem fontFamily="monospace" fontSize="13px">Profile</MenuItem>
            </ProfileModal>
            <MenuDivider/>
            <MenuItem onClick={logoutHandler} fontFamily="monospace" fontSize="13px">Logout</MenuItem>
          </MenuList>
        </Menu>
      </div>
    </Box>
    <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay/>
      <DrawerContent borderWidth="1px" borderColor="gray.300" borderRadius="3xl">
        <DrawerHeader borderBottomWidth="1px" fontFamily="monospace" fontWeight="medium">Search Users</DrawerHeader>
        <DrawerBody>
          <Box display="flex" pb={2}>
            <Input
              fontFamily="monospace"
              placeholder="Search by Name or Email Address"
              mr={2}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={handleSearch} fontFamily="monospace">Search</Button>
          </Box>
          {loading ? <ChatLoading/>: 
            (
              searchResult?.map(user => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={()=>accessChat(user._id)}
                />
              ))
          )
          }
          {loadingChat && <Spinner ml="auto" display="flex"/>}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  </>
  )
}

export default SideDrawer