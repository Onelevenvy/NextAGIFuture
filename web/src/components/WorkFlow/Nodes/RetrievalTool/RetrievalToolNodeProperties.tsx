import { useUploadsQuery } from "@/hooks/useUploadsQuery";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import KBListModal from "./KBListModal";
import { FaDatabase } from "react-icons/fa";

interface RetrievalToolNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const RetrievalToolNodeProperties: React.FC<RetrievalToolNodePropertiesProps> = ({
  node,
  onNodeDataChange,
}) => {
  const [isKBListOpen, setIsKBListOpen] = useState(false);
  const { data: uploads, isLoading, isError } = useUploadsQuery();

  const addKB = (kb: string) => {
    const currentKBs = node.data.knowledgeBases || [];
    if (!currentKBs.includes(kb)) {
      onNodeDataChange(node.id, "knowledgeBases", [...currentKBs, kb]);
    }
  };

  const removeKB = (kb: string) => {
    const currentKBs = node.data.knowledgeBases || [];
    onNodeDataChange(
      node.id,
      "knowledgeBases",
      currentKBs.filter((k: string) => k !== kb)
    );
  };

  if (isLoading) return <Text>Loading knowledge bases...</Text>;
  if (isError) return <Text>Error loading knowledge bases</Text>;

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Knowledge Bases:</Text>
        {node.data.knowledgeBases?.map((kb: string) => (
          <HStack key={kb} justifyContent="space-between">
            <Box bg="#f2f4f7" borderRadius="md" w="full" p="1" m="0.5">
              <HStack spacing={"2"}>
                <FaDatabase />
                <Text fontWeight={"bold"}>{kb}</Text>
              </HStack>
            </Box>
            <IconButton
              aria-label="Remove knowledge base"
              icon={<DeleteIcon />}
              size="sm"
              onClick={() => removeKB(kb)}
            />
          </HStack>
        ))}
        <Button onClick={() => setIsKBListOpen(true)} mt={2}>
          Add Knowledge Base
        </Button>
      </Box>
      {isKBListOpen && (
        <KBListModal
          uploads={uploads?.data || []}
          onClose={() => setIsKBListOpen(false)}
          onAddKB={addKB}
          selectedKBs={node.data.knowledgeBases || []}
        />
      )}
    </VStack>
  );
};

export default RetrievalToolNodeProperties;