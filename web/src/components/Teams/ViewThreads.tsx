import {
  Flex,
  Spinner,
  Container,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { ThreadsService, type ApiError } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
// import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { DeleteIcon } from "@chakra-ui/icons";
import { useRouter, useSearchParams } from "next/navigation";

interface ChatHistoryProps {
  teamId: string;
  updateTabIndex: (index: number) => void;
}

const ChatHistory = ({ teamId, updateTabIndex }: ChatHistoryProps) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId");
  const navigate = useRouter();
  const showToast = useCustomToast();
  const rowTint = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
  const {
    data: threads,
    isLoading,
    isError,
    error,
  } = useQuery(["threads", teamId], () =>
    ThreadsService.readThreads({ teamId: Number.parseInt(teamId) })
  );
  const deleteThread = async (threadId: string) => {
    await ThreadsService.deleteThread({
      teamId: Number.parseInt(teamId),
      id: threadId,
    });
  };
  const deleteThreadMutation = useMutation(deleteThread, {
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail;
      showToast("Unable to delete thread.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["threads", teamId]);
      queryClient.invalidateQueries(["thread", threadId]);
    },
  });

  /**
   * Set the threadId in the search params and navigate to 'Chat' tab
   */
  const onClickRowHandler = (threadId: string) => {
    navigate.push(`/teams/${teamId}?threadId=${threadId}`);
    updateTabIndex(1);
  };

  const onDeleteHandler = (
    e: React.MouseEvent<HTMLButtonElement>,
    threadId: string
  ) => {
    e.stopPropagation();
    deleteThreadMutation.mutate(threadId);
  };

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
        threads && (
          <Container maxW="full">
            <TableContainer>
              <Table size={{ base: "sm", md: "md" }}>
                <Thead>
                  <Tr>
                    <Th>Start Time</Th>
                    <Th>Recent Query</Th>
                    <Th>Thread ID</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {threads.data.map((thread) => (
                    <Tr
                      key={thread.id}
                      onClick={() => onClickRowHandler(thread.id)}
                      _hover={{ backgroundColor: rowTint }}
                      cursor={"pointer"}
                    >
                      <Td>{new Date(thread.updated_at).toLocaleString()}</Td>
                      <Td>{thread.query}</Td>
                      <Td>{thread.id}</Td>
                      <Td>
                        <IconButton
                          size={"sm"}
                          aria-label="Delete"
                          icon={<DeleteIcon />}
                          onClick={(e) => onDeleteHandler(e, thread.id)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Container>
        )
      )}
    </>
  );
};

export default ChatHistory;
