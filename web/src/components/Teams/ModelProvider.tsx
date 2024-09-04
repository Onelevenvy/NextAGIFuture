"use client";
import React, {  useState, useCallback } from "react";
import { Control, Controller } from "react-hook-form";
import {
  FormControl,
  FormLabel,
  Button,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  Spinner,
} from "@chakra-ui/react";
import { ModelsOut } from "@/client/models/ModelsOut";
import { MemberUpdate } from "@/client/models/MemberUpdate";
import { ChevronDownIcon } from "@chakra-ui/icons";
import ModelProviderIcon from "../Icons/models";

const ModelSelect = ({
  models,
  control,
  onModelSelect,
  isLoading,
}: {
  models: ModelsOut | undefined;
  control: Control<MemberUpdate, any>;
  onModelSelect: (selectData: string) => void;
  isLoading: Boolean;
}) => {
  const groupedModels = models?.data.reduce(
    (acc, model) => {
      const providerName = model.provider.provider_name;
      if (!acc[providerName]) {
        acc[providerName] = [];
      }
      acc[providerName].push(model);
      return acc;
    },
    {} as Record<string, typeof models.data>
  );

  const [selectedModelProvider, setSelectedModelProvider] =
    useState<string>("openai");

  const updateSelectedProvider = useCallback(
    (modelName: string) => {
      const selectedModelData = models?.data.find(
        (model) => model.ai_model_name === modelName
      );
      if (selectedModelData) {
        setSelectedModelProvider(selectedModelData.provider.provider_name);
      }
    },
    [models]
  );

  return (
    <Box p={5}>
      <FormControl mb={4}>
        <FormLabel htmlFor="model">选择模型</FormLabel>
        {isLoading ? (
          <Spinner size="md" />
        ) : (
          <Controller
            name="model"
            control={control}
            render={({ field }) => {
              updateSelectedProvider(field.value!);
              return (
                <Menu autoSelect={false}>
                  <MenuButton
                    as={Button}
                    leftIcon={
                      <ModelProviderIcon
                        modelprovider_name={selectedModelProvider}
                        w={5}
                        h={5}
                      />
                    }
                    rightIcon={<ChevronDownIcon w={4} h={4} />}
                    w="full"
                    textAlign={"left"}
                  >
                    {field.value || "选择一个模型"}
                  </MenuButton>
                  <MenuList>
                    {Object.keys(groupedModels || {}).map((providerName) => (
                      <MenuGroup key={providerName} title={providerName}>
                        {groupedModels![providerName].map((model) => (
                          <MenuItem
                            key={model.id}
                            onClick={() => {
                              field.onChange(model.ai_model_name);
                              onModelSelect(model.ai_model_name);
                            }}
                          >
                            <ModelProviderIcon
                              modelprovider_name={providerName}
                              mr={2}
                              w={6}
                              h={6}
                            />
                            {model.ai_model_name}
                          </MenuItem>
                        ))}
                      </MenuGroup>
                    ))}
                  </MenuList>
                </Menu>
              );
            }}
          />
        )}
      </FormControl>
    </Box>
  );
};

export default ModelSelect;
