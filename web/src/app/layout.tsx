import type { Viewport } from "next";
import { ChakraUIProviders } from "@/components/Provider/ChakraUIProvider";
import { StrictMode } from "react";
import ClientProvider from "../components/Provider/ClientProviders";
import QueryClientProviderWrapper from "@/components/Provider/QueryClientProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

const LocaleLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang={"en"} className="h-full">
      <head>
        <meta name="theme-color" content="#FFFFFF" />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
      </head>
      <body>
        <StrictMode>
          <ChakraUIProviders>
            <QueryClientProviderWrapper>
              <ClientProvider>{children}</ClientProvider>
            </QueryClientProviderWrapper>
          </ChakraUIProviders>
        </StrictMode>
      </body>
    </html>
  );
};

export default LocaleLayout;
