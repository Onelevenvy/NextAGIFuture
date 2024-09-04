import { useState } from "react";
import { Box, Button, Collapse, VStack, Text } from "@chakra-ui/react";
import ProviderUpdate from "./ProviderUpdate";
import { useModelProviderContext } from "@/contexts/modelprovider";
import ModelsIcon from "@/components/Icons/models";

interface ModelCardProps {
  providerName: string;
}

const ModelProviderCard: React.FC<ModelCardProps> = ({ providerName }) => {
  const providerInfo = useModelProviderContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleCollapse = () => setIsOpen(!isOpen);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p="6"
      mb="4"
      boxShadow="md"
    >
      <Box display={"flex"} flexDirection={"column"}>
        <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
          <ModelsIcon
            modelprovider_name={providerName}
            w={8}
            h={8}
            my={3}
            mr={3}
          />
          <Text mb="2" fontSize={"2xl"} fontWeight={"bold"}>
            {providerName}
          </Text>
        </Box>
        <Box>
          <Button onClick={() => setIsModalOpen(true)}>设置</Button>
          <ProviderUpdate
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        </Box>
        <Box>
          <Button onClick={toggleCollapse} mb="4">
            {isOpen ? "隐藏模型" : "显示模型"}
          </Button>

          <Collapse in={isOpen}>
            <VStack align="start">
              {providerInfo?.models.map((model, index) => (
                <Box
                  key={index}
                  display={"flex"}
                  flexDirection={"row"}
                  alignItems={"center"}
                  w="full"
                  _hover={{
                    bg: "gray.200",
                  }}
                >
                  <ModelsIcon
                    modelprovider_name={providerName}
                    w={4}
                    h={4}
                    mr={2}
                  />
                  <Text>{model.ai_model_name}</Text>
                </Box>
              ))}
            </VStack>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};

export default ModelProviderCard;
