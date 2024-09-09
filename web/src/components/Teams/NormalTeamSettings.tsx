import { useParams } from "next/navigation";
import { useQuery } from "react-query";
import { ApiError, MembersService } from "@/client";
import { Box, Flex, Spinner, useDisclosure } from "@chakra-ui/react";
import { useRef } from "react";
import useCustomToast from "@/hooks/useCustomToast";
import EditTeamMember from "../Members";
import DebugPreview from "./DebugPreview";

export default function NormalTeamSettings() {
  const editMemberModal = useDisclosure();
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
            mt={"2"}
          >
            <Box bg="transparent" h={"full"} w="30%">
              {member?.map((member) => (
                <EditTeamMember
                  key={member.id}
                  teamId={Number.parseInt(teamId)}
                  member={member}
                  isOpen={editMemberModal.isOpen}
                  onClose={editMemberModal.onClose}
                  ref={formRef}
                />
              ))}
            </Box>
            <Box
              w="full"
              display={"flex"}
              flexDirection={"column"}
              overflow={"hidden"}
            >
              <DebugPreview teamId={teamId} triggerSubmit={triggerSubmit} />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
