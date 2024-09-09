"use client";

import { ApiError } from "@/client";
import { UpdateLanguageMe } from "@/client/models/UpdateLanguageMe";
import { UsersService } from "@/client/services/UsersService";
import useAuth from "@/hooks/useAuth";
import useCustomToast from "@/hooks/useCustomToast";
import {
  Container,
  FormControl,
  FormErrorMessage,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { ChangeEvent } from "react";
import { useMutation, useQueryClient } from "react-query";

export default function LanguagePage() {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const { currentUser } = useAuth();

  const mutation = useMutation(
    (language: string) =>
      UsersService.updateUserLanguage({ requestBody: { language } }),
    {
      onSuccess: () => {
        showToast("Success!", "User updated successfully.", "success");
      },
      onError: (err: ApiError) => {
        const errDetail = err.body?.detail;
        showToast("Something went wrong.", `${errDetail}`, "error");
      },
      onSettled: () => {
        queryClient.invalidateQueries("users");
        queryClient.invalidateQueries("currentUser");
      },
    }
  );

  const onChangeLanguage = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    mutation.mutate(selectedLanguage);
  };

  return (
    <Container maxW="full">
      <FormControl mt={8}>
        <Select
          defaultValue={currentUser?.language}
          onChange={onChangeLanguage}
        >
          <option value="zh-Hans">中文-简体</option>
          <option value="en-US">English-US</option>
        </Select>
      </FormControl>
    </Container>
  );
}
