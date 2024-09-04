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
        <Box display={"flex"} flexDirection={"row"} maxH={"full"} h="full">
          <Box
            display={"flex"}
            bg="transparent"
            flexDirection={"column"}
            width={"25%"}
          >
            {member?.map((member) => (
              <EditAgent
                key={member.id}
                teamId={Number.parseInt(teamId)}
                member={member}
                ref={formRef}
              />
            ))}
          </Box>
          <Box display={"flex"} flexDirection={"column"} w="full">
            <Box>
              <ChatMain isPlayground={false} />
              <Box>
                <Button onClick={triggerSubmit}>Save</Button>
              </Box>
              {/* <Box border={"1px solid red"}>
         
              </Box> */}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
