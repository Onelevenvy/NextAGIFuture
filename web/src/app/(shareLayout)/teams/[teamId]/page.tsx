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

function Team() {
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
            <Box></Box>
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
              <Tabs
                variant="enclosed"
                index={tabIndex}
                onChange={setTabIndex}
                h="full"
              >
                {team.workflow === "sequential" ||
                team.workflow === "hierarchical" ? (
                  <TabList>
                    <Tab>团队构建</Tab>
                    <Tab>Chat明细及调试</Tab>
                    <Tab>Threads记录</Tab>
                  </TabList>
                ) : null}
                <TabPanels h={"full"}>
                  <TabPanel h="full">
                    {team.workflow === "sequential" ||
                    team.workflow === "hierarchical" ? (
                      <Flow />
                    ) : (
                      <Box h="full" minH="full">
                        <TeamSettings />
                      </Box>
                    )}
                  </TabPanel>

                  {team.workflow === "sequential" ||
                  team.workflow === "hierarchical" ? (
                    <Box>
                      <TabPanel>
                        <ChatTeam />
                      </TabPanel>
                      <TabPanel>
                        <ViewThreads
                          teamId={teamId}
                          updateTabIndex={setTabIndex}
                        />
                      </TabPanel>
                    </Box>
                  ) : null}
                </TabPanels>
              </Tabs>
            </Box>
          </Box>
        )
      )}
    </>
  );
}

export default Team;
