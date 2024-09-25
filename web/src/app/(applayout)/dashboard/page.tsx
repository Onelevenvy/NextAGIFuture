"use client";
import useAuth from "@/hooks/useAuth";
import { Box, Container, Text } from "@chakra-ui/react";
import React from "react";

function Dashboard() {
  const { currentUser } = useAuth();

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
