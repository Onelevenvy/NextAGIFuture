"use client";
import {
  Flex,
  Spinner,
  Heading,
  Box,
  SimpleGrid,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { SkillsService, type ApiError } from "@/client";
import ActionsMenu from "@/components/Common/ActionsMenu";

import useCustomToast from "@/hooks/useCustomToast";
import React from "react";
import {
  RiApps2Fill,
  RiArchiveDrawerFill,
  RiBarChartFill,
} from "react-icons/ri";

import { useTabSearchParams } from "@/hooks/useTabSearchparams";
import TabSlider from "@/components/Common/TabSlider";
import { useTranslation } from "react-i18next";

function Skills() {
  const showToast = useCustomToast();
  const { t } = useTranslation();
  const {
    data: skills,
    isLoading,
    isError,
    error,
  } = useQuery("skills", () => SkillsService.readSkills({}));

  if (isError) {
    const errDetail = (error as ApiError).body?.detail;
    showToast("Something went wrong.", `${errDetail}`, "error");
  }
  const rowTint = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
  const options = [
    {
      value: "all",
      text: t(`panestate.tools.all`),
      icon: <RiApps2Fill className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "managed",
      text: t(`panestate.tools.builtin`),
      icon: <RiArchiveDrawerFill className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "def",
      text: t(`panestate.tools.custom`),
      icon: <RiBarChartFill className="w-[14px] h-[14px] mr-1" />,
    },
  ];
  const [activeTab, setActiveTab] = useTabSearchParams({
    searchParamName: "tooltype",
    defaultTab: "all",
  });
  return (
    <>
      {isLoading ? (
        // TODO: Add skeleton
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        skills && (
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
                  {skills.data.map((skill) => (
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
                      <Heading size="md">{skill.name}</Heading>
                      <Box
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {skill.icon}
                      </Box>
                      <Box
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {skill.description}
                      </Box>
                      <Box pt={4}>
                        {!skill.managed ? (
                          <ActionsMenu type={"Skill"} value={skill} />
                        ) : (
                          <Badge colorScheme="green"> Managed</Badge>
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
    </>
  );
}

export default Skills;
