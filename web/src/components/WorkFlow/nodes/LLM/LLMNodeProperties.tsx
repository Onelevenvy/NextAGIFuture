import ModelSelect from "@/components/Common/ModelProvider";
import { useModelQuery } from "@/hooks/useModelQuery";
import { useVariableInsertion } from "@/hooks/graphs/useVariableInsertion";
import {
  Box,
  Input,
  Text,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Textarea,
} from "@chakra-ui/react";
import type React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { VariableReference } from "../../variableSystem";

interface LLMNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
  availableVariables: VariableReference[];
}

const LLMNodeProperties: React.FC<LLMNodePropertiesProps> = ({
  node,
  onNodeDataChange,
  availableVariables,
}) => {
  const [temperatureInput, setTemperatureInput] = useState("");
  const [systemPromptInput, setSystemPromptInput] = useState("");
  const [showVariables, setShowVariables] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (node && node.data.temperature !== undefined) {
      setTemperatureInput(node.data.temperature.toString());
    }
    if (node && node.data.systemMessage !== undefined) {
      setSystemPromptInput(node.data.systemMessage || "");
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

  const handleSystemPromptChange = useCallback(
    (value: string) => {
      setSystemPromptInput(value);
      onNodeDataChange(node.id, "systemMessage", value);
    },
    [node.id, onNodeDataChange]
  );

  const {
    showVariables: showVariablesHook,
    setShowVariables: setShowVariablesHook,
    inputRef: inputRefHook,
    handleKeyDown: handleKeyDownHook,
    insertVariable: insertVariableHook,
  } = useVariableInsertion<HTMLTextAreaElement>({
    onValueChange: (value) => handleSystemPromptChange(value),
    availableVariables,
  });

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
          bg="#edf2f7"
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
      <Box>
        <Text fontWeight="bold">System Prompt:</Text>
        <Popover
          isOpen={showVariablesHook}
          onClose={() => setShowVariablesHook(false)}
          placement="bottom-start"
        >
          <PopoverTrigger>
            <Textarea
              ref={inputRefHook}
              value={systemPromptInput}
              onChange={(e) => handleSystemPromptChange(e.target.value)}
              onKeyDown={handleKeyDownHook}
              placeholder="Write your prompt here. Use '/' to insert variables."
              style={{
                whiteSpace: "pre-wrap",
                minHeight: "100px",
              }}
            />
          </PopoverTrigger>
          <PopoverContent>
            <VStack align="stretch">
              {availableVariables.map((v) => (
                <Button
                  key={`${v.nodeId}.${v.variableName}`}
                  onClick={() =>
                    insertVariableHook(`${v.nodeId}.${v.variableName}`)
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
    </VStack>
  );
};

export default LLMNodeProperties;
