"use client";
import useAuth from "@/hooks/useAuth";
import { Box, Container, Image, Text } from "@chakra-ui/react";
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
          <Image
            src={'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/outputs/f967b5c9-c3c8-4f4b-9f1f-708e2dfda39c_0.png'}
            alt="aaa"
            width={"auto"}
            height={"auto"}
          />
        </Box>
      </Container>
    </>
  );
}

export default Dashboard;
