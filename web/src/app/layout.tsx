import type { Viewport } from "next";
import { ChakraUIProviders } from "@/components/Provider/ChakraUIProvider";
import { StrictMode } from "react";
import ClientProvider from "../components/Provider/ClientProviders";
import QueryClientProviderWrapper from "@/components/Provider/QueryClientProvider";
import { getLocaleOnServer } from "@/i18n/server";
import I18nServer from "@/components/i18n/i18n-server";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

const LocaleLayout = ({ children }: { children: React.ReactNode }) => {
  const locale = getLocaleOnServer();
  return (
    // <html lang={"en"} className="h-full">
    <html lang={locale ?? "en"} className="h-full">
      <head>
        <meta name="theme-color" content="#FFFFFF" />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
      </head>
      <body>
        <StrictMode>
          <ChakraUIProviders>
            <QueryClientProviderWrapper>
              <ClientProvider>
                <I18nServer>{children}</I18nServer>
              </ClientProvider>
            </QueryClientProviderWrapper>
          </ChakraUIProviders>
        </StrictMode>
      </body>
    </html>
  );
};

export default LocaleLayout;
