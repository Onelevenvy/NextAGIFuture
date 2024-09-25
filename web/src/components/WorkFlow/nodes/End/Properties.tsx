import {
  FormControl,
  FormErrorMessage,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import type React from "react";

interface BasePropertiesProps {
  children: React.ReactNode;
  nodeName: string;
  onNameChange: (newName: string) => void;
  nameError: string | null;
}

const BaseProperties: React.FC<BasePropertiesProps> = ({
  children,
  nameError,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl isInvalid={!!nameError}>
        <FormErrorMessage>{nameError}</FormErrorMessage>
      </FormControl>
      {children}
    </VStack>
  );
};

export default BaseProperties;
