import React, { createContext, useContext } from "react";

const ModelContext = createContext<ProviderInfo | null>(null);

export const ModelProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: any;
}) => <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;

export const useModelProviderContext = () => useContext(ModelContext);
