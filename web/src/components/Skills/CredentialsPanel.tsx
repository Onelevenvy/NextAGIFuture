import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { SkillOut } from '@/client';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

interface CredentialsPanelProps {
  skill: SkillOut;
  onClose: () => void;
  onSave: (credentials: Record<string, string>) => void;
}

const CredentialsPanel: React.FC<CredentialsPanelProps> = ({ skill, onClose, onSave }) => {
  const [credentials, setCredentials] = useState<Record<string, string>>(() => {
    if (skill.credentials) {
      return Object.entries(skill.credentials).reduce((acc, [key, value]) => {
        acc[key] = value.value || '';
        return acc;
      }, {} as Record<string, string>);
    }
    return {};
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const handleInputChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const updatedCredentials = Object.entries(credentials).reduce((acc, [key, value]) => {
      if (skill.credentials && skill.credentials[key]) {
        acc[key] = { ...skill.credentials[key], value };
      }
      return acc;
    }, {} as Record<string, any>);
    onSave(updatedCredentials);
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box width="300px" p={4} borderLeft="1px" borderColor="gray.200">
      <CloseButton onClick={onClose} position="absolute" right="8px" top="8px" />
      <Heading size="md" mb={4}>Set Credentials for {skill.display_name}</Heading>
      {skill.credentials && Object.keys(skill.credentials).length > 0 ? (
        <VStack spacing={4}>
          {Object.entries(skill.credentials).map(([key, credInfo]) => (
            <FormControl key={key}>
              <FormLabel>{credInfo.description || key}</FormLabel>
              <InputGroup>
                <Input
                  type={showPasswords[key] ? 'text' : 'password'}
                  value={credentials[key] || ''}
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
