import React, { useState } from 'react'
import { useDisclosure } from '@chakra-ui/hooks'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  Input,
  Box
} from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem'
import { Spinner } from '@chakra-ui/react'
import { UserBadgeItem } from "../UserAvatar/UserBadgeItem"



const GroupChatModal = ({ children }) => {
    
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const toast = useToast();

    const { user, chats, setChats } = ChatState();

    const originalOnClose = onClose; // new feature 

    const resetAndClose = () => {
        setGroupChatName("");         // Reset group chat name
        setSelectedUsers([]);         // Clear selected users
        setSearch("");                // Clear search text
        setSearchResult([]);          // Clear search results
        originalOnClose();            // Call the original onClose function
    };
    
    const handleSearch = async (query) => {

        setSearch(query);
        if(!query){
            return;
        }

        try {
            setLoading(true)
            
            const config = {
                headers: {
                Authorization: `Bearer ${user.token}`,
                },
            };

        const { data } = await axios.get(`/api/user?search=${search}`, config);
        //console.log(data);
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
    };
    const handleSubmit = async () => {
        if(!groupChatName || !selectedUsers){
            toast({
                title: "Please fill out all the feilds",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });         
            return; 
        }

        try {
            const config = {
                headers: {
                Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post("/api/chat/group", {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id)),
            }, config);

            setChats([data, ...chats]);
            resetAndClose();
            toast({
                title: "New Group Chat Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });  

        } catch (error) {
            toast({
                title: "Failed to Create Chat!",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });            
        }
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id ))
    };


    
    const handleGroup = (userToAdd) => {
        if(selectedUsers.includes(userToAdd)){
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });         
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    return (
        <>
        <span onClick={onOpen}>{children}</span>

        <Modal isOpen={isOpen} onClose={resetAndClose} >
            <ModalOverlay />
            <ModalContent borderRadius="3xl">
            <ModalHeader
                fontSize="25px"
                fontFamily="monospace"
                display="flex"
                justifyContent="center"
            >
                New Group
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody display="flex" flexDir="column" alignItems="center">
                <FormControl fontFamily="monospace">
                    <Input 
                        placeholder="Chat Name" 
                        mb={3}
                        onChange={(e) => setGroupChatName(e.target.value)}
                    />
                </FormControl>
                <FormControl fontFamily="monospace">
                    <Input 
                        placeholder="Add Users eg: John, Smith, Jane" 
                        mb={1}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </FormControl>
                <Box w="100%" display="flex" flexWrap="wrap">
                    { selectedUsers.map( u => (
                        <UserBadgeItem 
                            key={user._id} 
                            user={u}
                            handleFunction={() => handleDelete(u)}
                        />
                    ))}
                </Box>
                {loading ? <Spinner ml="auto" display="flex"/> : (
                    searchResult?.slice(0,4).map(user => (
                        <UserListItem 
                            key={user._id} 
                            user={user} 
                            handleFunction={() => handleGroup(user)}
                        />
                    ))
                )}
            </ModalBody>

            <ModalFooter>
                <Button colorScheme="gray" onClick={handleSubmit} fontFamily="monospace">
                    Create Chat
                </Button>
            </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}

export default GroupChatModal