import { CloseIcon } from "@chakra-ui/icons"
import { Box } from '@chakra-ui/react'
import React from 'react'

export const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Box
        px={2}
        py={1}
        borderRadius="lg"
        m={1}
        mb={2}
        variant="solid"
        fontSize={12}
        backgroundColor="GrayText"
        color="black"
        cursor="pointer"
        onClick={handleFunction}
        fontFamily="monospace"
    >
        {user.name}
        <CloseIcon pl={1}/>
    </Box>
  )
}

export default UserBadgeItem;