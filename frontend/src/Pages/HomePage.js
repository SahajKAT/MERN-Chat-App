import React from "react";
import { Container, Box, Text, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useHistory } from "react-router-dom";
import { useEffect } from "react"


const HomePage = () => {
  const history = useHistory();
    
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem("userInfo"));
      
      if (user) history.push("/chats");
    }, [history]);


  return (
    <Container maxW='xl' centerContent>
      <Box
        d= "flex"
        justifyContent="center"
        p={3}
        bg={"white"}
        w="100%"
        m="40px 0 15px 0"
        borderRadius="3xl"
        borderWidth="1px"
      >
        <Text fontSize='4xl' fontFamily="monospace" fontWeight={500} color="black" textAlign="center">
          Quix-Chat
        </Text>
      </Box>
      <Box 
        bg="white" 
        w="100%" 
        p={4} 
        borderRadius="3xl" 
        fontFamily="monospace" 
        fontWeight={500}
        color="black" 
        borderWidth="1px"
      >
        <Tabs variant='soft-rounded' colorScheme="twitter">
          <TabList mb="1em">
            <Tab width="50%">Login</Tab>
            <Tab width="50%">Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {<Login/>}
            </TabPanel>
            <TabPanel>
              {<Signup/>}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
};

export default HomePage