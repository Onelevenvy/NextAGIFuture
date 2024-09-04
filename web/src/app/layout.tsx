"use client";

import type { Viewport } from "next";
import { ChakraProvider } from "@chakra-ui/react";

import { QueryClient, QueryClientProvider } from "react-query";

import { StrictMode } from "react";

import theme from "@/theme";

import { OpenAPI } from "@/client";

OpenAPI.BASE = "http://127.0.0.1:8000";
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || "";
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

const LocaleLayout = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <html lang={"en"} className="h-full">
      <head>
        <meta name="theme-color" content="#FFFFFF" />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
      </head>
      <body>
        <StrictMode>
          <ChakraProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </ChakraProvider>
        </StrictMode>
      </body>
    </html>
  );
};

export default LocaleLayout;
