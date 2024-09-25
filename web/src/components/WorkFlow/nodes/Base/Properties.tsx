import {
  FormControl,
  FormErrorMessage,
  HStack,
  IconButton,
  Input,
  VStack,
} from "@chakra-ui/react";
import type React from "react";

interface BasePropertiesProps {
  children: React.ReactNode;
  nodeName: string;
  onNameChange: (newName: string) => void;
  nameError: string | null;
  icon: React.ReactElement;
  colorScheme: string;
}

const BaseProperties: React.FC<BasePropertiesProps> = ({
  children,
  nodeName,
  onNameChange,
  nameError,
  icon,
  colorScheme,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <FormControl isInvalid={!!nameError}>
        <HStack spacing={1} mb={1}>
          <IconButton
            aria-label="names"
            icon={icon}
            colorScheme={colorScheme}
            size="xs"
          />
          <Input
            value={nodeName}
            onChange={(e) => onNameChange(e.target.value)}
            border={"1px solid white"}
            size={"sm"}
            fontWeight={"bold"}
            w={"50%"}
          />
        </HStack>
        <FormErrorMessage>{nameError}</FormErrorMessage>
      </FormControl>
      {children}
    </VStack>
  );
};

export default BaseProperties;
