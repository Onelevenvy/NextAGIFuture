import React, { useEffect, useState } from "react";
import { Box, VStack, Text, Input } from "@chakra-ui/react";
import ModelSelect from "@/components/Common/ModelProvider";
import { useModelQuery } from "@/hooks/useModelQuery";
import { useForm } from "react-hook-form";

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

  const { control, setValue } = useForm({
    mode: "onBlur",
    criteriaMode: "all",
  });

  const { data: models, isLoading: isLoadingModel } = useModelQuery();

  const onModelSelect = (modelName: string) => {
    onNodeDataChange(node.id, "model", modelName);
    const selectedModel = models?.data.find(
      (model) => model.ai_model_name === modelName
    );
    if (selectedModel) {
      onNodeDataChange(
        node.id,
        "openai_api_key",
        selectedModel.provider.api_key
      );
      onNodeDataChange(
        node.id,
        "provider",
        selectedModel.provider.provider_name
      );
      onNodeDataChange(
        node.id,
        "openai_api_base",
        selectedModel.provider.base_url
      );
    }
    setValue("model", modelName);
    setValue("openai_api_key", selectedModel?.provider.api_key);
    setValue("provider", selectedModel?.provider.provider_name);
    setValue("openai_api_base", selectedModel?.provider.base_url);
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Model:</Text>
        <ModelSelect
          models={models}
          control={control}
          onModelSelect={onModelSelect}
          isLoading={isLoadingModel}
          value={node.data.model}
        />
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
  );
};

export default LLMNodeProperties;
