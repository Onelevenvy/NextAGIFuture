"use client";
import {
  Flex,
  Spinner,
  Container,
  Heading,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Box,
  PopoverBody,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverFooter,
  PopoverHeader,
  PopoverArrow,
  IconButton,
  Popover,
  Icon,
  Button,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { TeamsService, type ApiError } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { ChevronRightIcon } from "@chakra-ui/icons";
import Flow from "@/components/ReactFlow/Flow";
import ChatTeam from "@/components/Teams/ChatTeam";
import ViewThreads from "@/components/Teams/ViewThreads";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TeamSettings from "@/components/Teams/TeamSettings";
import ChatHistoryList from "@/components/Playground/ChatHistoryList";
import { MdBuild } from "react-icons/md";
import { ImHistory } from "react-icons/im";
import ChatMain from "@/components/Playground/ChatMain";
function Team() {
  const bgColor = useColorModeValue("ui.bgMain", "ui.bgMainDark");
  const buttonColor = useColorModeValue("ui.main", "ui.main");
  const showToast = useCustomToast();
  const { teamId } = useParams() as { teamId: string };

  const [tabIndex, setTabIndex] = useState(0);
  const {
    data: team,
    isLoading,
    isError,
    error,
  } = useQuery(`team/${teamId}`, () =>
    TeamsService.readTeam({ id: Number.parseInt(teamId) })
  );

  if (isError) {
    const errDetail = (error as ApiError).body?.detail;
    showToast("Something went wrong.", `${errDetail}`, "error");
  }

  return (
    <>
      {isLoading ? (
        // TODO: Add skeleton
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        team && (
          <Box
            display={"flex"}
            h="full"
            maxH="full"
            minH={"full"}
            flexDirection={"column"}
            overflow={"hidden"}
          >
            <Box pt="4" pl="4">
              <Breadcrumb>
                <BreadcrumbItem>
                  <Link href="/teams">
                    <BreadcrumbLink>Teams</BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <Link href="#">
                    <BreadcrumbLink fontWeight={"bold"}>
                      {team.name}
                    </BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
              </Breadcrumb>
            </Box>
            <Box
              maxW="full"
              display={"flex"}
              flexDirection={"column"}
              maxHeight="full"
              h="full"
              overflow={"hidden"}
            >
              {team.workflow === "sequential" ||
              team.workflow === "hierarchical" ? (
                <Box
                 
                  h="full"
                  display={"flex"}
                  flexDirection={"row"}
                  maxH={"full"}
                >
                  <Box  w="80%" maxH={"full"}>
                    <Flow />
                  </Box>
                  <Box
                    // w="full"
                    w="20%"
                    display={"flex"}
                    flexDirection={"column"}
                   
                    maxH={"full"}
                  >
                    <Box
                      w="full"
                      h="full"
                      bg="white"
                      borderRadius={"lg"}
                      display={"flex"}
                      flexDirection={"column"}
                    >
                      <Box
                        display={"flex"}
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                      >
                        <Text mt="5" ml="5" fontSize={"xl"} fontWeight={"bold"}>
                          调试预览
                        </Text>
                        <Box
                          display={"flex"}
                          flexDirection={"row"}
                          mt="5"
                          mr="5"
                          alignItems={"center"}
                        >
                          <Popover preventOverflow={false} isLazy={true}>
                            {/* {Todo: 需要修改chathistory组件，现在点击会跳转到playground，需要改成根据情况而定 team or playground} */}
                            <PopoverTrigger>
                              <IconButton
                                aria-label="history"
                                icon={
                                  <Icon
                                    as={ImHistory}
                                    h="6"
                                    w="6"
                                    color={buttonColor}
                                  />
                                }
                                h="10"
                                w="10"
                                bg={bgColor}
                                as={"button"}
                                // onClick={handelOpenChatHistory}
                              />
                            </PopoverTrigger>
                            <PopoverContent zIndex="9999" bg={"white"}>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverHeader>聊天记录</PopoverHeader>
                              <PopoverBody
                                maxH="50vh"
                                overflowY="auto"
                                zIndex="9999"
                                bg={"white"}
                              >
                                <Box zIndex="1001">
                                  <ChatHistoryList teamId={teamId} />
                                </Box>
                              </PopoverBody>
                              <PopoverFooter />
                            </PopoverContent>
                          </Popover>

                          <Button
                            ml={"5"}
                            bg={buttonColor}
                            borderRadius={"md"}
                            // onClick={triggerSubmit}
                            _hover={{ backgroundColor: "#1c86ee" }}
                            rightIcon={<MdBuild color={"white"} />}
                          >
                            <Text color={"white"}>发布</Text>
                          </Button>
                        </Box>
                      </Box>
                      <Box
                        display={"flex"}
                        w="full"
                        h="full"
                        maxH={"full"}
                        bg={"white"}
                        // mt="10"
                      >
                        <ChatMain isPlayground={false} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box h="full" minH="full">
                  <TeamSettings />
                </Box>
              )}
            </Box>
          </Box>
        )
      )}
    </>
  );
}

export default Team;
