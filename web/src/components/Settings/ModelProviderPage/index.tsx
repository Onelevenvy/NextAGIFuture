import { Spinner, Flex, Container, SimpleGrid } from "@chakra-ui/react";
import { useQuery } from "react-query";
import { ApiError } from "@/client/core/ApiError";
import useCustomToast from "@/hooks/useCustomToast";
import { ModelService } from "@/client/services/ModelService";
import ModelProviderCard from "./ProviderCard";
import { ModelProvider } from "@/contexts/modelprovider";

export default function ModelProviderPage() {
  const {
    data: models,
    isLoading,
    isError,
    error,
  } = useQuery("model", () => ModelService.readModels());
  const showToast = useCustomToast();

  if (isError) {
    const errDetail = (error as ApiError).body?.detail;
    showToast("Something went wrong.", `${errDetail}`, "error");
  }

  const groupedModels = models?.data.reduce(
    (acc, model) => {
      const providerName = model.provider.provider_name;

      if (!acc[providerName]) {
        acc[providerName] = {
          providerId: model.provider.id,
          baseUrl: model.provider.base_url!,
          apiKey: model.provider.api_key!,
          icon: model.provider.icon!,
          description: model.provider.description!,
          aiModelNames: [],
        };
      }

      acc[providerName].aiModelNames.push(model.ai_model_name);
      return acc;
    },
    {} as Record<string, ProviderInfo>
  );

  return (
    <>
      {isLoading ? (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <Container maxW="container.lg" py="8">
          <SimpleGrid columns={{ base: 1, md: 1 }} spacing="8">
            {groupedModels &&
              Object.entries(groupedModels).map(([providerName, model]) => {
                return (
                  <ModelProvider key={providerName} value={model}>
                    <ModelProviderCard providerName={providerName} />
                  </ModelProvider>
                );
              })}
          </SimpleGrid>
        </Container>
      )}
    </>
  );
}
