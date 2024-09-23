import { Box, Flex, Spinner } from "@chakra-ui/react";
import useCustomToast from "@/hooks/useCustomToast";
import DebugPreview from "./DebugPreview";
import TqxWorkflow from "../WorkFlow";
import { useEffect } from "react";
import { useGraphStore } from "@/stores/graphStore";
import { ApiError } from "@/client";

interface WorkflowSettingProps {
  teamId: number;
  triggerSubmit: () => void;
}

function WorkflowTeamSettings({ teamId, triggerSubmit }: WorkflowSettingProps) {
  const showToast = useCustomToast();
  const { graphs, isLoading, isError, error, fetchGraphs, createDefaultGraph } =
    useGraphStore();

  useEffect(() => {
    const initializeGraphs = async () => {
      await fetchGraphs(teamId);
      if (!graphs || graphs.data.length === 0) {
        await createDefaultGraph(teamId);
      }
    };

    initializeGraphs();
  }, [teamId, fetchGraphs, createDefaultGraph, graphs]);

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
        <>
          <Box w="80%" maxH={"full"} bg={"#f6f8fa"} mr="2">
            <TqxWorkflow
              teamId={teamId}
              buildConfig={graphs?.data[0]?.config || {}}
            />
          </Box>
          <Box w="20%">
            <DebugPreview teamId={teamId} triggerSubmit={triggerSubmit} />
          </Box>
        </>
      )}
    </>
  );
}

export default WorkflowTeamSettings;
