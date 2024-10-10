import { SearchIcon } from "@chakra-ui/icons";
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import type React from "react";
import { useMemo, useState } from "react";
import { FaDatabase } from "react-icons/fa";

interface KBListProps {
  uploads: any[]; // Replace 'any' with the correct type from useUploadsQuery
  onClose: () => void;
  onAddKB: (kb: string) => void;
  selectedKBs: string[];
}

const KBListModal: React.FC<KBListProps> = ({
  uploads,
  onClose,
  onAddKB,
  selectedKBs,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUploads = useMemo(() => {
    return uploads.filter((upload) =>
      upload.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uploads, searchQuery]);

  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Knowledge Base</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search knowledge bases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            {filteredUploads.map((upload) => (
              <HStack key={upload.id} justifyContent="space-between">
                <HStack spacing={"2"}>
                  <FaDatabase />
                  <Text>{upload.name}</Text>
                </HStack>
                <Button
                  size="sm"
                  onClick={() => onAddKB(upload.name)}
                  isDisabled={selectedKBs.includes(upload.name)}
                >
                  {selectedKBs.includes(upload.name) ? "Added" : "Add"}
                </Button>
              </HStack>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default KBListModal;