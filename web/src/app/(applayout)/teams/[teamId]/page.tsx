"use client";
import {
  Flex,
  Spinner,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { TeamsService, type ApiError } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";

import Flow from "@/components/ReactFlow/Flow";

import { useParams } from "next/navigation";
import Link from "next/link";
import NormalTeamSettings from "@/components/Teams/NormalTeamSettings";
import DebugPreview from "@/components/Teams/DebugPreview";
import { useRef } from "react";
import { color } from "framer-motion";
import ShowFlow from "@/app/flow/show/ShowFlow";
import WorkflowTeamSettings from "@/components/Teams/WorkflowTeamSettings";

function Team() {
  const showToast = useCustomToast();
  const { teamId } = useParams() as { teamId: string };

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
  const formRef = useRef<HTMLFormElement>(null);
  const triggerSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
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
        team && (
          <Box
            display={"flex"}
            h="full"
            maxH="full"
            flexDirection={"column"}
            overflow={"hidden"}
          >
            <Box py="3" pl="4" bg={"#f2f4f7"}>
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
              maxH={"full"}
            >
              {team.workflow === "sequential" ||
              team.workflow === "hierarchical" ? (
                <Box
                  h="full"
                  display={"flex"}
                  flexDirection={"row"}
                  maxH={"full"}
                  p="2"
                >
                  <Box w="80%" maxH={"full"} bg={"#f6f8fa"} mr="2">
                    <Flow />
                  </Box>
                  <Box w="20%">
                    <DebugPreview
                      teamId={Number.parseInt(teamId)}
                      triggerSubmit={triggerSubmit}
                      useDeployButton={true}
                    />
                  </Box>
                </Box>
              ) : team.workflow === "workflow" ? (
                <Box
                  h="full"
                  display={"flex"}
                  flexDirection={"row"}
                  maxH={"full"}
                  pt="2"
                  px="1"
                  borderRadius={"lg"}
                >
                  <WorkflowTeamSettings
                    teamId={Number.parseInt(teamId)}
                    triggerSubmit={triggerSubmit}
                  />
                </Box>
              ) : (
                <Box h="full" maxH={"full"} borderRadius="md">
                  <NormalTeamSettings teamData={team} />
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
