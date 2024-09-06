"use client";

import useLocaleStore from "@/store/localeStore";
import { Select } from "@chakra-ui/react";
import React, { ChangeEvent } from "react";
export default function LanguagePage() {
  const { setLocaleValue } = useLocaleStore();
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLocaleValue(event.target.value);
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
