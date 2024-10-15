import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';
import { SkillOut } from '@/client';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillOut;
  onSave: (credentials: Record<string, string>) => void;
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({ isOpen, onClose, skill, onSave }) => {
  const [credentials, setCredentials] = useState<Record<string, string>>(skill.credentials || {});

  const handleInputChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(credentials);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Set Credentials for {skill.display_name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {Object.entries(skill.input_parameters || {}).map(([key, type]) => (
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
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CredentialsModal;
