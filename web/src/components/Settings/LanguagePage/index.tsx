"use client";

import { Select } from "@chakra-ui/react";


export default function LanguagePage() {
  return (
    <>
      <Select>
        <option value="zh-Hans">zh-Hans</option>
        <option value="en-US">en-US</option>
      </Select>
    </>
  );
}
