import { Box, Input, Select, Text, VStack } from "@chakra-ui/react";
import type React from "react";
import { useEffect, useState } from "react";

interface LLMNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const QuestionClassifierProperties: React.FC<LLMNodePropertiesProps> = ({
  node,
  onNodeDataChange,
}) => {
  const [temperatureInput, setTemperatureInput] = useState("");

  useEffect(() => {
    if (node && node.data.temperature !== undefined) {
      setTemperatureInput(node.data.temperature.toString());
    }
  }, [node]);
  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">QC:</Text>
        <Select
          value={node.data.model}
          onChange={(e) => onNodeDataChange(node.id, "model", e.target.value)}
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
        </Select>
      </Box>
      <Box>
        <Text fontWeight="bold">Temperature:</Text>
        <Input
          type="number"
          value={temperatureInput}
          onChange={(e) => {
            setTemperatureInput(e.target.value);
            const numValue =
              e.target.value === "" ? 0 : Number.parseFloat(e.target.value);
            onNodeDataChange(node.id, "temperature", numValue);
          }}
          step={0.1}
          min={0}
          max={1}
        />
      </Box>
    </VStack>
  );
};

export default QuestionClassifierProperties;
