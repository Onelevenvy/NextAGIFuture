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
            <Box py="3" pl="4">
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
                  <Box w="80%" maxH={"full"}>
                    <Flow />
                  </Box>
                </Box>
              ) : (
                <Box h="full" minH="full">
                  <NormalTeamSettings />
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
