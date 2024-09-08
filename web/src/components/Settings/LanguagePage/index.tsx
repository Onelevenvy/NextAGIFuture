"use client";

import { ApiError } from "@/client";
import { UpdateLanguageMe } from "@/client/models/UpdateLanguageMe";
import { UserOut } from "@/client/models/UserOut";
import { UsersService } from "@/client/services/UsersService";
import useAuth from "@/hooks/useAuth";
import useCustomToast from "@/hooks/useCustomToast";
import useLocaleStore from "@/store/localeStore";
import { Select, useColorModeValue } from "@chakra-ui/react";
import React, { ChangeEvent, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
export default function LanguagePage() {
  const { setLocaleValue } = useLocaleStore();
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLocaleValue(event.target.value);
  };


  const queryClient = useQueryClient();
  const color = useColorModeValue("inherit", "ui.white");
  const showToast = useCustomToast();
  const [editMode, setEditMode] = useState(false);
  const { user: currentUser } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<UserOut>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name,
      email: currentUser?.email,
    },
  });

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updateInfo = async (data: UpdateLanguageMe) => {
    await UsersService.updateUserLanguage({ requestBody: data });
  };

  const mutation = useMutation(updateInfo, {
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
  });

  const onSubmit: SubmitHandler<UpdateLanguageMe> = async (data) => {
    mutation.mutate(data);
  };

  const onCancel = () => {
    reset();
    toggleEditMode();
  };






  return (
    <>
      <Select defaultValue={"zh-Hans"} onChange={handleChange}>

        <option value="zh-Hans">中文-简体</option>
        <option value="en-US">English-US</option>

     

      </Select>
    </>
  );
}
