import { Box, Button, Flex, IconButton, Spinner } from "@chakra-ui/react";
import useCustomToast from "@/hooks/useCustomToast";
import DebugPreview from "./DebugPreview";
import TqxWorkflow from "../WorkFlow";
import { useEffect, useState } from "react";
import { ApiError, GraphsService } from "@/client";
import { useQuery, useQueryClient } from "react-query";
import { CloseIcon } from "@chakra-ui/icons";

interface WorkflowSettingProps {
  teamId: number;
  triggerSubmit: () => void;
}

function WorkflowTeamSettings({ teamId, triggerSubmit }: WorkflowSettingProps) {
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  const [currentTeamId, setCurrentTeamId] = useState(teamId);

  const {
    data: graphs,
    isLoading,
    isError,
    error,
  } = useQuery(
    ["graphs", currentTeamId],
    () => GraphsService.readGraphs({ teamId: currentTeamId }),
    {
      keepPreviousData: true,
    }
  );

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
        await createDefaultGraph(currentTeamId);
      }
    };

    initializeGraphs();
  }, [graphs, currentTeamId]);

  useEffect(() => {
    setCurrentTeamId(teamId);
    queryClient.invalidateQueries(["graphs", teamId]);
  }, [teamId, queryClient]);

  if (isError) {
    const errDetail = (error as ApiError).body?.detail;
    showToast("Something went wrong.", `${errDetail}`, "error");
  }
  const [showDebugPreview, setShowDebugPreview] = useState(false);

  return (
    <Flex width="full" height="full">
      <Box width={showDebugPreview ? "80%" : "100%"} transition="width 0.3s">
        {isLoading ? (
          <Flex justify="center" align="center" height="100%" width="100%">
            <Spinner size="xl" color="ui.main" />
          </Flex>
        ) : (
          graphs && (
            <Box height="100%" bg="#f6f8fa">
              <TqxWorkflow teamId={currentTeamId} graphData={graphs} />
            </Box>
          )
        )}
      </Box>
      {showDebugPreview && (
        <Box
          width="20%"
          position="relative"
          borderLeft="1px solid"
          borderColor="gray.200"
        >
          <IconButton
            aria-label="Close Debug Preview"
            icon={<CloseIcon />}
            size="sm"
            position="absolute"
            top={2}
            right={2}
            onClick={() => setShowDebugPreview(false)}
          />
          <DebugPreview
            teamId={currentTeamId}
            triggerSubmit={triggerSubmit}
            useDeployButton={false}
          />
        </Box>
      )}
      {!showDebugPreview && (
        <Button
          position="fixed"
          bottom={4}
          right={4}
          onClick={() => setShowDebugPreview(true)}
        >
          Show Debug Preview
        </Button>
      )}
    </Flex>
  );
}

export default WorkflowTeamSettings;
