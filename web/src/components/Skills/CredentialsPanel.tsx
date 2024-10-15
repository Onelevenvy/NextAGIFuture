import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  CloseButton,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
} from '@chakra-ui/react';
import { SkillOut } from '@/client';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

interface CredentialsPanelProps {
  skill: SkillOut;
  onClose: () => void;
  onSave: (credentials: Record<string, any>) => void;
}

const CredentialsPanel: React.FC<CredentialsPanelProps> = ({ skill, onClose, onSave }) => {
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const toast = useToast();

  useEffect(() => {
    if (skill.credentials) {
      setCredentials(JSON.parse(JSON.stringify(skill.credentials)));
    } else {
      setCredentials({});
    }
  }, [skill]);

  const handleInputChange = (key: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: value
      }
    }));
  };

  const handleSave = () => {
    onSave(credentials);
    toast({
      title: "Credentials saved",
      description: "Your changes have been successfully saved.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box width="300px" p={4} borderLeft="1px" borderColor="gray.200">
      <CloseButton onClick={onClose} position="absolute" right="8px" top="8px" />
      <Heading size="md" mb={4}>Set Credentials for {skill.display_name}</Heading>
      {credentials && Object.keys(credentials).length > 0 ? (
        <VStack spacing={4}>
          {Object.entries(credentials).map(([key, credInfo]) => (
            <FormControl key={key}>
              <FormLabel>{credInfo.description || key}</FormLabel>
              <InputGroup>
                <Input
                  type={showPasswords[key] ? 'text' : 'password'}
                  value={credInfo.value || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={() => togglePasswordVisibility(key)}>
                    {showPasswords[key] ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          ))}
          <Button mt={4} colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </VStack>
      ) : (
        <Text>No credentials required for this tool.</Text>
      )}
    </Box>
  );
};

export default CredentialsPanel;
