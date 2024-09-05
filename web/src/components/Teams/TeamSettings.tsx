import { useParams } from "next/navigation";
import EditAgent from "../Members/EditAgent";
import { useQuery } from "react-query";
import { ApiError, MembersService } from "@/client";
import { Box, Button, Flex, Spinner } from "@chakra-ui/react";
import { useRef } from "react";
import useCustomToast from "@/hooks/useCustomToast";
import ChatMain from "../Playground/ChatMain";

export default function TeamSettings() {
  const { teamId } = useParams() as { teamId: string };
  const showToast = useCustomToast();
  const {
    data: members,
    isLoading,
    isError,
    error,
  } = useQuery(`teams/${teamId}/members`, () =>
    MembersService.readMembers({ teamId: Number.parseInt(teamId) })
  );

  const member = members?.data || [];
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
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <Box
          maxH={"full"}
          h="full"
          w="full"
          minW="full"
          display={"flex"}
          flexDirection={"row"}
        >
          <Box
            display={"flex"}
            w="full"
            h="full"
            flexDirection={"row"}
            ml={"2"}
          >
            <Box bg="transparent" h={"full"} w="30%">
              {member?.map((member) => (
                <EditAgent
                  key={member.id}
                  teamId={Number.parseInt(teamId)}
                  member={member}
                  ref={formRef}
                />
              ))}
            </Box>
            <Box w="full" display={"flex"} flexDirection={"column"}>
              <Box ml={"auto"} mr="2">
                <Button onClick={triggerSubmit}>Save</Button>
              </Box>
              <Box w="full" h="full" bg={"white"} borderRadius={"lg"} pt="8">
                <ChatMain isPlayground={false} />
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
