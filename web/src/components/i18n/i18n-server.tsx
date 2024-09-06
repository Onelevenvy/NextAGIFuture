"use client";

import React from "react";
import I18N from "./i18n";
import { ToastProvider } from "./toast";
import useLocaleStore from "@/store/localeStore";

export type II18NServerProps = {
  children: React.ReactNode;
};

const I18NServer = ({ children }: II18NServerProps) => {
  const { localeValue } = useLocaleStore();
  const locale = localeValue!;

  return (
    <I18N {...{ locale }}>
      <ToastProvider>{children}</ToastProvider>
    </I18N>
  );
};

export default I18NServer;
