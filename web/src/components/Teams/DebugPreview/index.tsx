import { Box } from "@chakra-ui/react";
import ChatMain from "@/components/Playground/ChatMain";
import DebugPreviewHead from "./head";

function DebugPreview({
  teamId,
  triggerSubmit,
}: {
  teamId: string;
  triggerSubmit: () => void;
}) {
  return (
    <Box
      w="full"
      h="full"
      bg="white"
      borderRadius={"lg"}
      display={"flex"}
      flexDirection={"column"}
    >
      <Box py="5" overflow={"hidden"}>
        <DebugPreviewHead teamId={teamId} triggerSubmit={triggerSubmit} />
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
