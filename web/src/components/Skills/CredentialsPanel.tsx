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
} from '@chakra-ui/react';
import { SkillOut } from '@/client';

interface CredentialsPanelProps {
  skill: SkillOut;
  onClose: () => void;
  onSave: (credentials: Record<string, string>) => void;
}

const CredentialsPanel: React.FC<CredentialsPanelProps> = ({ skill, onClose, onSave }) => {
  const [credentials, setCredentials] = useState<Record<string, string>>(skill.credentials || {});

  const handleInputChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(credentials);
  };

  return (
    <Box width="300px" p={4} borderLeft="1px" borderColor="gray.200">
      <CloseButton onClick={onClose} position="absolute" right="8px" top="8px" />
      <Heading size="md" mb={4}>Set Credentials for {skill.display_name}</Heading>
      <VStack spacing={4}>
        {Object.entries(skill.credentials || {}).map(([key, value]) => (
          <FormControl key={key}>
            <FormLabel>{key}</FormLabel>
            <Input
              type="password"
              value={credentials[key] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
          </FormControl>
        ))}
      </VStack>
      <Button mt={4} colorScheme="blue" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
};

export default CredentialsPanel;
