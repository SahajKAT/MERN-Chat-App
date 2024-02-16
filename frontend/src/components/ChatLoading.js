import { Stack } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/skeleton'
import React from 'react'

const ChatLoading = () => {
  return (
    <Stack>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
        <Skeleton height='45px' borderRadius='8px'/>
    </Stack>
  )
}

export default ChatLoading