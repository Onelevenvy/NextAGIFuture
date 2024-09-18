import React, { useEffect, useState } from "react";
import { Box, VStack, Text, Select, Input } from "@chakra-ui/react";
import BaseProperties from "../Base/Properties";

interface LLMNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const LLMNodeProperties: React.FC<LLMNodePropertiesProps> = ({
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
    <BaseProperties>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="bold">Model:</Text>
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
                e.target.value === "" ? 0 : parseFloat(e.target.value);
              onNodeDataChange(node.id, "temperature", numValue);
            }}
            step={0.1}
            min={0}
            max={1}
          />
        </Box>
      </VStack>
    </BaseProperties>
  );
};

export default LLMNodeProperties;
