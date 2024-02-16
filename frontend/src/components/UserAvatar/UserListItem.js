import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import { ChatState } from "../../Context/ChatProvider";
import React from "react";

const UserListItem = ({ user, handleFunction }) => {


  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#808080",
        color: "white",
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="2xl"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box fontFamily="monospace">
        <Text fontWeight="medium"><b>{user.name}</b></Text>
        <Text fontSize="xs">
          <b>Email Address: </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;