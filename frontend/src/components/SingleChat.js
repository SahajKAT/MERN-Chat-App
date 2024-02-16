import React, { useState, useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, Text } from "@chakra-ui/layout"
import { FormControl, IconButton, Input, Spinner, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from "../config/ChatLogics"
import ProfileModal from "./miscellaneous/ProfileModal"
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal"
import axios from 'axios';
import "./styles.css"
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import Lottie from "react-lottie"
import animationData from "../animations/typing.json"

const ENDPOINT = "http://localhost:4000";

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const toast = useToast();

    const { user, selectedChat, setSelectedChat, notification, setNotification } =  ChatState();

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );

            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id);

        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };
    
    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));


    }, []);

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat]);


    useEffect(() => {
      socket.on("message recieved", (newMessageRecieved) => {
        if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id){
            if(!notification.includes(newMessageRecieved)){
                setNotification([newMessageRecieved, ...notification]);
                setFetchAgain(!fetchAgain);
            }
        } else {
            setMessages([...messages, newMessageRecieved]);
        }

      })
    })
    
    

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id)
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                
                setNewMessage("");

                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );
                
                socket.emit("new message", data);
                setMessages([...messages, data]);

            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }

        }

    };


    
    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
    
        let lastTypingTime = new Date().getTime();
    
        var timerLength = 3000;

        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    
    };
    

    
    
    // Inline CSS for typing animation
    const typingAnimationStyle = {
        '@keyframes typing': {
            from: { width: 0 },
            to: { width: '100%' }
        },
        '@keyframes blinkCaret': {
            '50%': { borderColor: 'transparent' }
        },
        overflow: 'hidden',
        borderRight: '.15em solid orange',
        whiteSpace: 'nowrap',
        letterSpacing: '.15em',
        animation: 'typing 3.5s steps(40, end), blinkCaret .75s step-end infinite'
    };
    
    return (
        <>
        {selectedChat ? (
            <>
            <Text
                fontSize={{ base: "28px", md: "30px" }}
                pb={3}
                px={2}
                w="100%"
                fontFamily="monospace"
                display="flex"
                justifyContent={{ base: "space-between" }}
                alignItems="center"
            >
                <IconButton
                    display={{ base: "flex", md: "none" }}
                    icon={<ArrowBackIcon/>}
                    onClick={() => setSelectedChat("")}
                />

                {!selectedChat.isGroupChat ? (
                    <>
                    {getSender(user, selectedChat.users)}
                    <ProfileModal user={getSenderFull(user, selectedChat.users)}/>
                    </>
                ) : (
                    <>
                    <>{selectedChat.chatName.toUpperCase()}</>
                    <UpdateGroupChatModal
                        fetchAgain = {fetchAgain}
                        setFetchAgain = {setFetchAgain}
                        fetchMessages = {fetchMessages}
                    />
                    </>
                )}
                
            </Text>
            <Box
                display="flex"
                flexDir="column"
                justifyContent="flex-end"
                p={3}
                bg="#E8E8E8"
                w="100%"
                h="100%"
                borderRadius="3xl"
                overflowY="hidden"

            >
                {loading ? (
                    <Spinner
                        size="md"
                        w={10}
                        h={10}
                        alignSelf="center"
                        margin="auto"
                    />
                ):(
                    <div className="messages">
                        <ScrollableChat messages={messages}/>
                    </div>
                )}
                <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                    {isTyping ? (
                        <div>
                            <Lottie
                                options={defaultOptions}
                                width={50}
                                style={{ marginBottom: 15, marginLeft: 0, height: 25 }}
                            />
                        </div>
                    ) : (
                        <></>
                    )}
                    <Input
                        variant="filled"
                        bg="#E0E0E0"
                        placeholder="Enter a message..."
                        onChange={typingHandler}
                        value={newMessage}
                        borderRadius="2xl"
                    />
                </FormControl>
            </Box>
            </>
        ) : (
            <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                <Text fontSize="xl" pb={3} fontFamily="monospace" sx={typingAnimationStyle}>
                    Click On A User To Start Chatting
                </Text>
            </Box>
        )}
        
        </>
    )
}

export default SingleChat