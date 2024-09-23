import { Box, Flex, Spinner } from "@chakra-ui/react";
import useCustomToast from "@/hooks/useCustomToast";
import DebugPreview from "./DebugPreview";
import TqxWorkflow from "../WorkFlow";
import { useEffect } from "react";
import { ApiError, GraphsService } from "@/client";
import { useQuery } from "react-query";

interface WorkflowSettingProps {
  teamId: number;
  triggerSubmit: () => void;
}

function WorkflowTeamSettings({ teamId, triggerSubmit }: WorkflowSettingProps) {
  const showToast = useCustomToast();

  const {
    data: graphs,
    isLoading,
    isError,
    error,
  } = useQuery("graphs", () => GraphsService.readGraphs({ teamId: teamId }));

  const createDefaultGraph = async (teamId: number) => {
    try {
      const defaultConfig = {
        id: "b48a5f20-5d99-4b2e-972d-cb811a208e2a",
        name: "Flow Visualization",
        nodes: [
          {
            id: "start",
            type: "start",
            position: { x: 88, y: 172 },
            data: { label: "Start" },
          },
          {
            id: "end",
            type: "end",
            position: { x: 891.4025316455695, y: 221.5569620253164 },
            data: { label: "End" },
          },
          {
            id: "llm",
            type: "llm",
            position: { x: 500.04430379746833, y: 219.95189873417723 },
            data: { label: "LLM", model: "glm-4-flash", temperature: 0.1 },
          },
        ],
        edges: [
          {
            id: "reactflow__edge-start-1right-llm-3left",
            source: "start",
            target: "llm",
            sourceHandle: "right",
            targetHandle: "left",
            type: "default",
          },
          {
            id: "reactflow__edge-llm-3right-end-5left",
            source: "llm",
            target: "end",
            sourceHandle: "right",
            targetHandle: "left",
            type: "default",
          },
        ],
        metadata: {
          entry_point: "llm",
          start_connections: [{ target: "llm", type: "default" }],
          end_connections: [{ source: "llm", type: "default" }],
        },
      };
      const validJsonConfig = JSON.parse(JSON.stringify(defaultConfig));
      const uniqueName = `DefaultGraph_${teamId}_${Date.now()}`;
      await GraphsService.createGraph({
        teamId: Number(teamId),
        requestBody: {
          name: uniqueName,
          description: "自动创建的默认图表",
          config: validJsonConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error creating default graph:", error);
    }
  };

  useEffect(() => {
    const initializeGraphs = async () => {
      if (graphs?.data.length === 0) {
        await createDefaultGraph(teamId);
      }
    };

    initializeGraphs();
  }, [graphs, teamId]);

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
          {graphs && (
            <>
              <Box w="80%" maxH={"full"} bg={"#f6f8fa"} mr="2">
                <TqxWorkflow teamId={teamId} graphData={graphs} />
              </Box>
              <Box w="20%">
                <DebugPreview teamId={teamId} triggerSubmit={triggerSubmit} />
              </Box>
            </>
          )}
        </>
      )}
    </>
  );
}

export default WorkflowTeamSettings;
