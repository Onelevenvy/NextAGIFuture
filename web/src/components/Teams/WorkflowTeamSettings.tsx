import { useParams } from "next/navigation";
import { useQuery } from "react-query";
import { ApiError, GraphsService, MembersService, TeamOut } from "@/client";
import { Box, Flex, Spinner, useDisclosure } from "@chakra-ui/react";
import { useRef } from "react";
import useCustomToast from "@/hooks/useCustomToast";
import EditTeamMember from "../Members";
import DebugPreview from "./DebugPreview";
import TeamInforCard from "./TeamInfo";
import TqxWorkflow from "@/app/flow/WorkFlow/TqxWorkflow";
import { useGraphsQuery } from "@/hooks/useGraphsQuery";

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
            {/* <TqxWorkflow teamId={teamId} /> */}
          </Box>
          <Box w="20%">
            <DebugPreview teamId={teamId} triggerSubmit={triggerSubmit} />
          </Box>
          ){" "}
        </>
      )}
    </>
  );
}

export default WorkflowTeamSettings;
