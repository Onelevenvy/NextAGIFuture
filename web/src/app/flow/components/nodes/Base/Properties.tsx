import React from "react";
import { Box } from "@chakra-ui/react";

interface BasePropertiesProps {
  children: React.ReactNode;
}

const BaseProperties: React.FC<BasePropertiesProps> = ({ children }) => {
  return (
    <Box w="200px" maxW={"200px"} minW={"200px"} h="full" p="2">
      {children}
    </Box>
  );
};

export default BaseProperties;
