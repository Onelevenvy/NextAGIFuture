"use client"

import { Box, Container, Text } from "@chakra-ui/react";
import { useQueryClient } from "react-query";

import type { UserOut } from "@/client";
import React from "react";

function Dashboard() {
  const queryClient = useQueryClient();

  const currentUser = queryClient.getQueryData<UserOut>("currentUser");

  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Text fontSize="2xl">
            Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
          </Text>
          <Text>Welcome back, nice to see you again!</Text>
        </Box>
      </Container>
    </>
  );
}

export default Dashboard;
