import React from "react";
import { Text, Input, VStack, FormControl, FormErrorMessage } from "@chakra-ui/react";

interface BasePropertiesProps {
  children: React.ReactNode;
  nodeName: string;
  onNameChange: (newName: string) => void;
  nameError: string | null;
}

const BaseProperties: React.FC<BasePropertiesProps> = ({ children, nodeName, onNameChange, nameError }) => {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl isInvalid={!!nameError}>
        <Text fontWeight="bold" mb={2}>Node Name:</Text>
        <Input 
          value={nodeName} 
          onChange={(e) => onNameChange(e.target.value)}
        />
        <FormErrorMessage>{nameError}</FormErrorMessage>
      </FormControl>
      {children}
    </VStack>
  );
};

export default BaseProperties;
