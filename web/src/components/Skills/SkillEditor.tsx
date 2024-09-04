import ReactJson from "@microlink/react-json-view";
import { useEffect } from "react";
import {
  type ApiError,
  SkillsService,
  type ToolDefinitionValidate,
} from "@/client";
import { useMutation } from "react-query";

export const skillPlaceholder = {
  url: "https://example.com",
  method: "GET",
  headers: {},
  type: "function",
  function: {
    name: "Enter skill name",
    description: "Enter skill description",
    parameters: {
      type: "object",
      properties: {
        param1: {
          type: "integer",
          description: "Describe this parameter",
        },
        param2: {
          type: "string",
          enum: ["option1"],
          description: "Select from the provided options",
        },
      },
      required: ["param1", "param2"],
    },
  },
};

interface SkillEditorProps {
  value: object;
  onChange: (...event: any[]) => void;
  onError: (message: string | null) => void;
}

const SkillEditor = ({
  value,
  onChange,
  onError,
  ...props
}: SkillEditorProps) => {
  const validateSkill = async (data: ToolDefinitionValidate) => {
    await SkillsService.validateSkill({
      requestBody: data,
    });
  };

  const mutation = useMutation(validateSkill, {
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail;
      onError(errDetail);
    },
    onSuccess: () => {
      onError(null);
    },
  });

  useEffect(() => {
    mutation.mutate({ tool_definition: value });
  }, [value, mutation, mutation.mutate]);

  return (
    <ReactJson
      {...props}
      style={{ padding: "1rem" }}
      name={"skill"}
      src={value as object}
      theme="monokai"
      iconStyle="circle"
      displayDataTypes={false}
      enableClipboard={false}
      collapsed={4}
      collapseStringsAfterLength={27}
      onEdit={(e) => onChange(e.updated_src)}
      onDelete={(e) => onChange(e.updated_src)}
      onAdd={(e) => onChange(e.updated_src)}
    />
  );
};

export default SkillEditor;
