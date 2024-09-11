import { useState } from "react";
import { Box, Button, Collapse, VStack, Text } from "@chakra-ui/react";
import ProviderUpdate from "./ProviderUpdate";
import { useModelProviderContext } from "@/contexts/modelprovider";
import ModelProviderIcon from "@/components/Icons/models";
import ModelProviderIconLong from "@/components/Icons/Providers";
import { CiSettings } from "react-icons/ci";
import {
  MdOutlineKeyboardDoubleArrowDown,
  MdOutlineKeyboardDoubleArrowUp,
} from "react-icons/md";
import { useTranslation } from "react-i18next";

interface ModelCardProps {
  providerName: string;
}

const ModelProviderCard: React.FC<ModelCardProps> = ({ providerName }) => {
  const providerInfo = useModelProviderContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const toggleCollapse = () => setIsOpen(!isOpen);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      bg={"#e5e7eb"}
      w="full"
      minW="full"
    >
      <Box display={"flex"} flexDirection={"column"}>
        <Box
          display={"flex"}
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          pt="3"
          pl="3"
        >
          <ModelProviderIconLong
            modelprovider_name={providerName}
            h="12"
            w="40"
          />
          <Box mr="2">
            <Button
              size={"sm"}
              onClick={() => setIsModalOpen(true)}
              leftIcon={<CiSettings />}
            >
              {t(`setting.modal.setting`)}
            </Button>
            <ProviderUpdate
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />
          </Box>
        </Box>

        <Box>
          <Box bg={"#edeef1"}>
            <Button
              onClick={toggleCollapse}
              size={"sm"}
              bg="transparent"
              leftIcon={
                isOpen ? (
                  <MdOutlineKeyboardDoubleArrowUp />
                ) : (
                  <MdOutlineKeyboardDoubleArrowDown />
                )
              }
            >
              {isOpen ?  t(`setting.setting.hidemodel`) :  t(`setting.setting.showmodel`)}
            </Button>
          </Box>
          <Collapse in={isOpen}>
            <VStack align="start" bg={"#edeef1"}>
              {providerInfo?.models.map((model, index) => (
                <Box
                  key={index}
                  display={"flex"}
                  flexDirection={"row"}
                  alignItems={"center"}
                  w="full"
                  pl="3"
                >
                  <ModelProviderIcon
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
