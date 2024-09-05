import { useParams } from "next/navigation";
import EditAgent from "../Members/EditAgent";
import { useQuery } from "react-query";
import { ApiError, MembersService } from "@/client";
import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useRef } from "react";
import useCustomToast from "@/hooks/useCustomToast";
import ChatMain from "../Playground/ChatMain";
import { MdBuild } from "react-icons/md";

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
              <Box
                w="full"
                h="full"
                bg="white"
                borderRadius={"lg"}
                display={"flex"}
                flexDirection={"column"}
              >
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Text mt="5" ml="5" fontSize={"xl"} fontWeight={"bold"}>
                    调试预览
                  </Text>
                  <Button
                    mt="5"
                    mr="5"
                    bg={"#2762e7"}
                    borderRadius={"md"}
                    onClick={triggerSubmit}
                    _hover={{ backgroundColor: "#1c86ee" }}
                    rightIcon={<MdBuild color={"white"} />}
                  >
                    <Text color={"white"}>发布</Text>
                  </Button>
                </Box>
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
