import ChatMain from "@/components/Playground/ChatMain";
import { Box } from "@chakra-ui/react";
import DebugPreviewHead from "./head";

function DebugPreview({
  teamId,
  triggerSubmit,
  useDeployButton,
}: {
  teamId: number;
  triggerSubmit: () => void;
  useDeployButton: boolean;
}) {
  return (
    <Box
      w="full"
      h="full"
      bg="white"
      borderRadius={"lg"}
      display={"flex"}
      flexDirection={"column"}
      overflow={"hidden"}
    >
      <Box py="5" overflow={"hidden"}>
        <DebugPreviewHead
          teamId={teamId}
          triggerSubmit={triggerSubmit}
          useDeployButton={useDeployButton}
        />
      </Box>
      <Box
        display={"flex"}
        w="full"
        h="full"
        maxH={"full"}
        bg={"white"}
        mt={"2"}
        overflowY={"auto"}
      >
        <ChatMain isPlayground={false} />
      </Box>
    </Box>
  );
}

export default DebugPreview;
