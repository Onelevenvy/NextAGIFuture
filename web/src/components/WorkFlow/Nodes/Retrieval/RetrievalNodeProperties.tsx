import { useVariableInsertion } from "@/hooks/graphs/useVariableInsertion";
import { useUploadsQuery } from "@/hooks/useUploadsQuery";
import {
  Box,
  Text,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Input,
  Select,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import type React from "react";
import { useCallback, useState, useEffect } from "react";
import { VariableReference } from "../../FlowVis/variableSystem";
import { DeleteIcon } from "@chakra-ui/icons";

interface RetrievalPropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
  availableVariables: VariableReference[];
}

const RetrievalProperties: React.FC<RetrievalPropertiesProps> = ({
  node,
  onNodeDataChange,
  availableVariables,
}) => {
  const [queryInput, setQueryInput] = useState("");
  const [ragMethod, setRagMethod] = useState("Adaptive_RAG");
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>([]);

  const { data: uploads, isLoading: isLoadingUploads } = useUploadsQuery();

  useEffect(() => {
    if (node) {
      setQueryInput(node.data.query || "");
      setRagMethod(node.data.rag_method || "Adaptive_RAG");
      setSelectedDatabases(node.data.knownledge_database || []);
    }
  }, [node]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQueryInput(value);
      onNodeDataChange(node.id, "query", value);
    },
    [node.id, onNodeDataChange]
  );

  const handleRagMethodChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setRagMethod(value);
      onNodeDataChange(node.id, "rag_method", value);
    },
    [node.id, onNodeDataChange]
  );

  const addDatabase = useCallback(
    (database: string) => {
      if (!selectedDatabases.includes(database)) {
        const newDatabases = [...selectedDatabases, database];
        setSelectedDatabases(newDatabases);

        // Find the selected upload to get usr_id and uploadid (kb_id)
        const selectedUpload = uploads?.data.find(
          (upload) => upload.name === database
        );

        if (selectedUpload) {
          onNodeDataChange(node.id, "knownledge_database", newDatabases);
          onNodeDataChange(node.id, "usr_id", selectedUpload.owner_id);
          onNodeDataChange(node.id, "kb_id", selectedUpload.id);
        }
      }
    },
    [selectedDatabases, node.id, onNodeDataChange, uploads]
  );

  const removeDatabase = useCallback(
    (database: string) => {
      const newDatabases = selectedDatabases.filter((db) => db !== database);
      setSelectedDatabases(newDatabases);
      onNodeDataChange(node.id, "knownledge_database", newDatabases);
    },
    [selectedDatabases, node.id, onNodeDataChange]
  );

  const {
    showVariables,
    setShowVariables,
    inputRef,
    handleKeyDown,
    insertVariable,
  } = useVariableInsertion<HTMLInputElement>({
    onValueChange: (value) => handleQueryChange(value),
    availableVariables,
  });

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Query:</Text>
        <Popover
          isOpen={showVariables}
          onClose={() => setShowVariables(false)}
          placement="bottom-start"
        >
          <PopoverTrigger>
            <Input
              ref={inputRef}
              value={queryInput}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter query. Use '/' to insert variables."
            />
          </PopoverTrigger>
          <PopoverContent>
            <VStack align="stretch">
              {availableVariables.map((v) => (
                <Button
                  key={`${v.nodeId}.${v.variableName}`}
                  onClick={() =>
                    insertVariable(`${v.nodeId}.${v.variableName}`)
                  }
                  size="sm"
                >
                  {v.nodeId}.{v.variableName}
                </Button>
              ))}
            </VStack>
          </PopoverContent>
        </Popover>
      </Box>

      <Box>
        <Text fontWeight="bold">RAG Method:</Text>
        <Select value={ragMethod} onChange={handleRagMethodChange}>
          <option value="Adaptive_RAG">Adaptive RAG</option>
          <option value="Agentic_RAG">Agentic RAG</option>
          <option value="Corrective_RAG">Corrective RAG</option>
          <option value="Self-RAG">Self-RAG</option>
        </Select>
      </Box>

      <Box>
        <Text fontWeight="bold">Knowledge Databases:</Text>
        {selectedDatabases.map((database) => (
          <HStack key={database} justifyContent="space-between">
            <Text>{database}</Text>
            <IconButton
              aria-label="Remove database"
              icon={<DeleteIcon />}
              size="sm"
              onClick={() => removeDatabase(database)}
            />
          </HStack>
        ))}
        <Select
          placeholder="Add Knowledge Database"
          onChange={(e) => addDatabase(e.target.value)}
          value=""
        >
          {uploads?.data
            .filter((upload) => !selectedDatabases.includes(upload.name))
            .map((upload) => (
              <option key={upload.id} value={upload.name}>
                {upload.name}
              </option>
            ))}
        </Select>
      </Box>
    </VStack>
  );
};

export default RetrievalProperties;
