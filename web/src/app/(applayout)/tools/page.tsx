"use client";
import { type ApiError, SkillOut, ToolsService } from "@/client";
import ActionsMenu from "@/components/Common/ActionsMenu";
import {
  Text,
  Box,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Tag,
  TagLabel,
  TagRightIcon,
  useColorModeValue,
} from "@chakra-ui/react";

import useCustomToast from "@/hooks/useCustomToast";
import React, { useState } from "react";
import {
  RiApps2Fill,
  RiArchiveDrawerFill,
  RiBarChartFill,
} from "react-icons/ri";

import TabSlider from "@/components/Common/TabSlider";
import { useSkillsQuery } from "@/hooks/useSkillsQuery";
import { useTabSearchParams } from "@/hooks/useTabSearchparams";
import { useTranslation } from "react-i18next";
import ToolsIcon from "@/components/Icons/Tools";
import { MdSettings } from "react-icons/md";
import CredentialsModal from "@/components/Skills/CredentialsModal";

function Skills() {
  const showToast = useCustomToast();
  const { t } = useTranslation();

  const { data: skills, isLoading, isError, error, refetch } = useSkillsQuery();
  if (isError) {
    const errDetail = (error as ApiError).body?.detail;
    showToast("Something went wrong.", `${errDetail}`, "error");
  }
  const rowTint = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
  const options = [
    {
      value: "all",
      text: t("panestate.tools.all"),
      icon: <RiApps2Fill className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "managed",
      text: t("panestate.tools.builtin"),
      icon: <RiArchiveDrawerFill className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "def",
      text: t("panestate.tools.custom"),
      icon: <RiBarChartFill className="w-[14px] h-[14px] mr-1" />,
    },
  ];
  const [activeTab, setActiveTab] = useTabSearchParams({
    searchParamName: "tooltype",
    defaultTab: "all",
  });

  const filteredSkills = skills?.data.filter(
    (skill) => skill.name !== "ask-human"
  );
  const [selectedSkill, setSelectedSkill] = useState<SkillOut | null>(null);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const handleOpenCredentialsModal = (skill: SkillOut) => {
    setSelectedSkill(skill);
    setIsCredentialsModalOpen(true);
  };

  const handleSaveCredentials = async (credentials: Record<string, string>) => {
    if (selectedSkill) {
      try {
        await ToolsService.updateSkillCredentials({
          id: selectedSkill.id,
          requestBody: credentials
        });
        showToast("Success", "Credentials updated successfully", "success");
        // 重新获取技能列表以更新UI
        refetch();
      } catch (error) {
        showToast("Error", "Failed to update credentials", "error");
      }
    }
  };

  return (
    <>
      {isLoading ? (
        // TODO: Add skeleton
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        filteredSkills && (
          <Box
            maxW="full"
            maxH="full"
            display="flex"
            flexDirection={"column"}
            overflow={"hidden"}
          >
            <Box
              display="flex"
              flexDirection={"row"}
              justifyItems={"center"}
              py={2}
              px={5}
            >
              <Box>
                <TabSlider
                  value={activeTab}
                  onChange={setActiveTab}
                  options={options}
                />
              </Box>
            </Box>
            <Box mt="2" overflow={"auto"}>
              <Box maxH="full">
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 4 }}
                  spacing={8}
                  mx="5"
                >
                  {filteredSkills.map((skill) => (
                    <Box
                      key={skill.id}
                      _hover={{ backgroundColor: rowTint }}
                      cursor={"pointer"}
                      p={4}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor="gray.200"
                      boxShadow="lg"
                      bg="white"
                    >
                      <HStack spacing="16px">
                        <ToolsIcon
                          h="8"
                          w="8"
                          tools_name={skill
                            .display_name!.toLowerCase()
                            .replace(/ /g, "_")}
                        />

                        <Heading noOfLines={1} size="md">
                          {skill.display_name}
                        </Heading>
                      </HStack>
                      <Box
                        overflow="hidden"
                        minH={"55px"}
                        h={"55px"}
                        maxH={"55px"}
                      >
                        <Text textOverflow="ellipsis" noOfLines={2}>
                          {skill.description}
                        </Text>
                      </Box>
                      <Box pt={4}>
                        {!skill.managed ? (
                          <ActionsMenu type={"Skill"} value={skill} />
                        ) : (
                          <Tag
                            variant="outline"
                            colorScheme="green"
                            onClick={() => handleOpenCredentialsModal(skill)}
                          >
                            <TagLabel>Built-in</TagLabel>
                            <TagRightIcon as={MdSettings} />
                          </Tag>
                        )}
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            </Box>
          </Box>
        )
      )}
      {selectedSkill && (
        <CredentialsModal
          isOpen={isCredentialsModalOpen}
          onClose={() => setIsCredentialsModalOpen(false)}
          skill={selectedSkill}
          onSave={handleSaveCredentials}
        />
      )}
    </>
  );
}

export default Skills;
