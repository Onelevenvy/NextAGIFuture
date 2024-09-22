import { ApiError, TeamOut } from "@/client";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import useCustomToast from "@/hooks/useCustomToast";
import DebugPreview from "./DebugPreview";
import { useGraphsQuery } from "@/hooks/useGraphsQuery";
import TqxWorkflow from "../WorkFlow/TqxWorkflow";

interface WorkflowSettingProps {
  teamData?: TeamOut;
  teamId: string;
  triggerSubmit: () => void;
}

function WorkflowTeamSettings({
  teamData,
  teamId,
  triggerSubmit,
}: WorkflowSettingProps) {
  const showToast = useCustomToast();
  const { data: graphs, isLoading, isError, error } = useGraphsQuery(teamId);
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
        <>
          <Box w="80%" maxH={"full"} bg={"#f6f8fa"} mr="2">
            <TqxWorkflow buildConfig={graphs?.data[0].config} />
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
