"use client";

import { Box, Container, Text } from "@chakra-ui/react";
import React from "react";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Text fontSize="2xl">
            Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
          </Text>
          <Text>Welcome back, nice to see you again!</Text>
          <Text>{t(`dashboard.tqx`)}</Text>
        </Box>
      </Container>
    </>
  );
}

export default Dashboard;
