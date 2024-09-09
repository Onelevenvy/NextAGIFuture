import { useParams } from "next/navigation";
import { useQuery } from "react-query";
import { ApiError, MembersService } from "@/client";
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Spinner,
  Text,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  PopoverFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import useCustomToast from "@/hooks/useCustomToast";
import ChatMain from "../Playground/ChatMain";
import { MdBuild } from "react-icons/md";
import { ImHistory } from "react-icons/im";
import ChatHistoryList from "@/components/Playground/ChatHistoryList";
import EditTeamMember from "../Members";
import DebugPreviewHead from "./DebugPreview/head";

export default function TeamSettings() {
  const editMemberModal = useDisclosure();
  const bgColor = useColorModeValue("ui.bgMain", "ui.bgMainDark");
  const buttonColor = useColorModeValue("ui.main", "ui.main");
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
            <Box w="full" display={"flex"} flexDirection={"column"}>
              <Box
                w="full"
                h="full"
                bg="white"
                borderRadius={"lg"}
                display={"flex"}
                flexDirection={"column"}
              >
                <DebugPreviewHead
                  teamId={teamId}
                  triggerSubmit={triggerSubmit}
                />
                <Box
                  display={"flex"}
                  w="full"
                  h="full"
                  maxH={"full"}
                  bg={"white"}
                  // mt="10"
                >
                  <ChatMain isPlayground={false} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
