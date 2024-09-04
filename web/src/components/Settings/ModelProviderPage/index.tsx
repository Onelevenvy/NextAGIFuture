import { Spinner, Flex, Container, SimpleGrid } from "@chakra-ui/react";
import { useQuery } from "react-query";
import { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import ModelProviderCard from "./ProviderCard";
import { ModelProvider } from "@/contexts/modelprovider";
import { ProviderService } from "@/client/services/ProviderService";

export default function ModelProviderPage() {
  const {
    data: providers,
    isLoading,
    isError,
    error,
  } = useQuery("provider", () => ProviderService.readProviderListWithModels());

  const showToast = useCustomToast();

  if (isError) {
    const errDetail = (error as ApiError).body?.detail;
    showToast("Something went wrong.", `${errDetail}`, "error");
  }

  return (
    <>
      {isLoading ? (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <Container maxW="container.lg" py="8">
          <SimpleGrid columns={{ base: 1, md: 1 }} spacing="8">
            {providers &&
              providers.providers.map((provider) => {
                return (
                  <ModelProvider key={provider.id} value={provider}>
                    <ModelProviderCard providerName={provider.provider_name} />
                  </ModelProvider>
                );
              })}
          </SimpleGrid>
        </Container>
      )}
    </>
  );
}
