import { Box, Text, VStack, Button, Popover, PopoverTrigger, PopoverContent, Input } from "@chakra-ui/react";
import type React from "react";
import { ToolsService } from "@/client/services/ToolsService";
import { useSkillsQuery } from "@/hooks/useSkillsQuery";
import { useState, useRef, useCallback } from "react";
import { VariableReference } from '../../variableSystem';

interface PluginNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
  availableVariables: VariableReference[];
}

const PluginNodeProperties: React.FC<PluginNodePropertiesProps> = ({
  node,
  onNodeDataChange,
  availableVariables,
}) => {
  const { data: skills } = useSkillsQuery();
  const tool = skills?.data.find(
    (skill) => skill.display_name === node.data.toolName
  );
  const [loading, setLoading] = useState(false);
  const [showVariables, setShowVariables] = useState<{[key: string]: boolean}>({});
  const inputRefs = useRef<{[key: string]: HTMLInputElement}>({});

  const handleInvoke = async () => {
    setLoading(true);
    try {
      const response = await ToolsService.invokeTools({
        toolName: node.data.toolName,
        requestBody: node.data.args,
      });
      console.log("Invoke Result:", response);
    } catch (err) {
      console.error("Error invoking tool", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((key: string, value: string) => {
    onNodeDataChange(node.id, "args", {
      ...node.data.args,
      [key]: value,
    });
  }, [node.id, node.data.args, onNodeDataChange]);

  const insertVariable = useCallback((key: string, variable: string) => {
    const input = inputRefs.current[key];
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const text = input.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newValue = before + `{${variable}}` + after;
      handleInputChange(key, newValue);
      input.focus();
      input.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
    }
    setShowVariables(prev => ({...prev, [key]: false}));
  }, [handleInputChange]);

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">Input param:</Text>
      </Box>
      {tool?.input_parameters &&
        Object.entries(tool.input_parameters).map(([key, value]) => (
          <Box key={key}>
            <Text fontWeight="bold">{key}:</Text>
            <Popover
              isOpen={showVariables[key]}
              onClose={() => setShowVariables(prev => ({...prev, [key]: false}))}
              placement="bottom-start"
            >
              <PopoverTrigger>
                <Input
                  ref={el => {if (el) inputRefs.current[key] = el;}}
                  value={node.data.args[key] || ""}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === '/') {
                      e.preventDefault();
                      setShowVariables(prev => ({...prev, [key]: true}));
                    }
                  }}
                  placeholder={`Enter ${key}. Use '/' to insert variables.`}
                />
              </PopoverTrigger>
              <PopoverContent>
                <VStack align="stretch">
                  {availableVariables.map((v) => (
                    <Button
                      key={`${v.nodeId}.${v.variableName}`}
                      onClick={() => insertVariable(key, `${v.nodeId}.${v.variableName}`)}
                      size="sm"
                    >
                      {v.nodeId}.{v.variableName}
                    </Button>
                  ))}
                </VStack>
              </PopoverContent>
            </Popover>
          </Box>
        ))}
      <Button onClick={handleInvoke} isLoading={loading}>
        Run Tool
      </Button>
    </VStack>
  );
};

export default PluginNodeProperties;