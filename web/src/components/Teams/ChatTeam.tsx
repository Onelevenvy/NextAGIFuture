import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Fade,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Tag,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { VscSend } from "react-icons/vsc";
import {
  type TeamChat,
  type ApiError,
  OpenAPI,
  type OpenAPIConfig,
  type ThreadUpdate,
  ThreadsService,
  type ThreadCreate,
  type InterruptDecision,
  type ChatResponse,
} from "../../client";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useCustomToast from "../../hooks/useCustomToast";

import { useState } from "react";
import {
  getQueryString,
  getRequestBody,
  getHeaders,
} from "../../client/core/request";
import type { ApiRequestOptions } from "../../client/core/ApiRequestOptions";

import { GrFormNextLink } from "react-icons/gr";
import { IoCreateOutline } from "react-icons/io5";
import { FaCheck, FaTimes } from "react-icons/fa";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { FiCopy } from "react-icons/fi";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Markdown from "../Markdown/Markdown";

// possible message types: "ai" | "human" | "tool" | "error" | "interrupt"

const getUrl = (config: OpenAPIConfig, options: ApiRequestOptions): string => {
  const encoder = config.ENCODE_PATH || encodeURI;

  const path = options.url
    .replace("{api-version}", config.VERSION)
    .replace(/{(.*?)}/g, (substring: string, group: string) => {
      // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
      if (options.path?.hasOwnProperty(group)) {
        return encoder(String(options.path[group]));
      }
      return substring;
    });

  const url = `${config.BASE}${path}`;
  if (options.query) {
    return `${url}${getQueryString(options.query)}`;
  }
  return url;
};

interface MessageBoxProps {
  message: ChatResponse;
  onResume: (decision: InterruptDecision, toolMessage: string | null) => void;
}

const MessageBox = ({ message, onResume }: MessageBoxProps) => {
  const { type, name, next, content, tool_calls, tool_output, documents } =
    message;
  const [decision, setDecision] = useState<InterruptDecision | null>(null);
  const [toolMessage, setToolMessage] = useState<string | null>(null);
  const { isOpen: showClipboardIcon, onOpen, onClose } = useDisclosure();

  const onDecisionHandler = (decision: InterruptDecision) => {
    setDecision(decision);
    onResume(decision, toolMessage);
  };

  return (
    <VStack spacing={0} my={8} onMouseEnter={onOpen} onMouseLeave={onClose}>
      <Container fontWeight={"bold"} display="flex" alignItems="center">
        {name}
        {next && <Icon as={GrFormNextLink} mx={2} />}
        {next && next}
        <Tag ml={4}>{type.toUpperCase()}</Tag>
      </Container>
      <Container pt={2}>
        {content && <Markdown content={content}></Markdown>}
        {tool_calls?.map((tool_call, index) => (
          <Box key={index} mb={4}>
            <Tag colorScheme="purple">{tool_call.name}</Tag>
            <Box mb={2}>
              {Object.keys(tool_call.args).map((attribute, index) => (
                <Text key={index}>
                  <b>{attribute}:</b> ={tool_call.args[attribute]}
                </Text>
              ))}
            </Box>
          </Box>
        ))}
        {tool_output && (
          <Container maxH={"10rem"} overflow="auto">
            <Markdown content={JSON.parse(tool_output)}></Markdown>
          </Container>
        )}
        {documents && (
          <Accordion mt={2} allowMultiple>
            {(
              JSON.parse(documents) as { score: number; content: string }[]
            ).map((document, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left" noOfLines={1}>
                      {document.content}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>{document.content}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {type === "interrupt" && name === "human" && !decision && (
          <Flex alignItems={"center"} gap="1rem" mt={8}>
            <InputGroup size="md" width={"20rem"}>
              <Input
                pr="3rem"
                placeholder="Your reply..."
                onChange={(e) => setToolMessage(e.target.value)}
              />
              <InputRightElement>
                <IconButton
                  icon={<VscSend />}
                  aria-label="human-reply"
                  isDisabled={!toolMessage?.trim().length}
                  onClick={() => onDecisionHandler("replied")}
                />
              </InputRightElement>
            </InputGroup>
          </Flex>
        )}
        {type === "interrupt" && name === "interrupt" && !decision && (
          <Flex alignItems={"center"} gap="1rem">
            <Tooltip>
              <Button
                autoFocus
                variant={"outline"}
                aria-label="approve"
                leftIcon={<FaCheck />}
                colorScheme="green"
                onClick={() => onDecisionHandler("approved")}
              >
                Approve
              </Button>
            </Tooltip>
            or
            <InputGroup size="md" width={"20rem"}>
              <Input
                pr="3rem"
                placeholder="Optional rejection instructions..."
                onChange={(e) => setToolMessage(e.target.value)}
              />
              <InputRightElement width="3rem">
                <Tooltip label="Reject">
                  <IconButton
                    variant={"outline"}
                    h="1.75rem"
                    aria-label="reject"
                    icon={<FaTimes />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => onDecisionHandler("rejected")}
                  >
                    Reject
                  </IconButton>
                </Tooltip>
              </InputRightElement>
            </InputGroup>
          </Flex>
        )}
      </Container>
      {content && (
        <Container pt={2}>
          <Fade in={showClipboardIcon}>
            <IconButton
              aria-label="copy to clipboard"
              icon={<FiCopy />}
              variant="outline"
              size="xs"
              onClick={() => navigator.clipboard.writeText(content)}
            />
          </Fade>
        </Container>
      )}
    </VStack>
  );
};

const ChatTeam = () => {
  const queryClient = useQueryClient();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId");
  const { teamId } = useParams() as { teamId: string };
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const showToast = useCustomToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatResponse[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  useQuery(
    ["thread", threadId],
    () =>
      ThreadsService.readThread({
        teamId: Number.parseInt(teamId),
        id: threadId!,
      }),
    {
      // Only run the query if messages state is empty and threadId is not null or undefined.
      enabled: !!threadId,
      refetchOnWindowFocus: false,
      onError: (err: ApiError) => {
        const errDetail = err.body?.detail;
        showToast("Something went wrong.", `${errDetail}`, "error");
        // if fail, then remove it from search params and delete existing messages
        navigate.push(`/teams/${teamId}`);
        setMessages([]);
      },
      onSuccess: (data) => {
        // if thread changed, then show new thread's messages
        if (!threadId || threadId === currentThreadId) return;
        setMessages([]);
        setCurrentThreadId(threadId);
        for (const message of data.messages) {
          processMessage(message);
        }
      },
    }
  );

  const createThread = async (data: ThreadCreate) => {
    const thread = await ThreadsService.createThread({
      teamId: Number.parseInt(teamId),
      requestBody: data,
    });
    return thread.id;
  };
  const createThreadMutation = useMutation(createThread, {
    onSuccess: (threadId) => {
      setCurrentThreadId(threadId);
      navigate.push(`/teams/${teamId}?threadId=${threadId}`);
    },
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail;
      showToast("Unable to create thread", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["threads", teamId]);
    },
  });

  const updateThread = async (data: ThreadUpdate) => {
    if (!threadId) return;
    const thread = await ThreadsService.updateThread({
      teamId: Number.parseInt(teamId),
      id: threadId,
      requestBody: data,
    });
    return thread.id;
  };
  const updateThreadMutation = useMutation(updateThread, {
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail;
      showToast("Unable to update thread.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["threads", teamId]);
    },
  });

  const processMessage = (response: ChatResponse) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];

      const messageIndex = updatedMessages.findIndex(
        (msg) => msg.id === response.id
      );

      if (messageIndex !== -1) {
        const currentMessage = updatedMessages[messageIndex];
        updatedMessages[messageIndex] = {
          ...currentMessage,
          // only content is streamable in chunks
          content: currentMessage.content
            ? currentMessage.content + (response.content || "")
            : null,
          tool_output: response.tool_output,
        };
      } else {
        updatedMessages.push(response);
      }
      return updatedMessages;
    });
  };

  const stream = async (id: number, threadId: string, data: TeamChat) => {
    const requestOptions = {
      method: "POST" as const,
      url: "/api/v1/teams/{id}/stream/{threadId}",
      path: {
        id,
        threadId,
      },
      body: data,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    };
    const url = getUrl(OpenAPI, requestOptions);
    const body = getRequestBody(requestOptions);
    const headers = await getHeaders(OpenAPI, requestOptions);

    await fetchEventSource(url, {
      // openWhenHidden: true,
      method: requestOptions.method,
      headers,
      body: JSON.stringify(body),
      onmessage(message) {
        const response: ChatResponse = JSON.parse(message.data);
        processMessage(response);
      },
    });
  };

  const chatTeam = async (data: TeamChat) => {
    // Create a new thread or update current thread with most recent user query
    const query = data.messages;
    let currentThreadId: string | undefined | null = threadId;
    if (!threadId) {
      currentThreadId = await createThreadMutation.mutateAsync({
        query: query[0].content,
      });
    } else {
      currentThreadId = await updateThreadMutation.mutateAsync({
        query: query[0].content,
      });
    }

    if (!currentThreadId)
      return showToast(
        "Something went wrong.",
        "Unable to obtain thread id",
        "error"
      );

    setMessages((prev) => [
      ...prev,
      {
        type: "human",
        id: self.crypto.randomUUID(),
        content: data.messages[0].content,
        name: "user",
      },
    ]);

    await stream(Number.parseInt(teamId), currentThreadId, data);
  };

  const mutation = useMutation(chatTeam, {
    onMutate: () => {
      setIsStreaming(true);
    },
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSuccess: () => {
      showToast("Streaming completed", "", "success");
    },
    onSettled: () => {
      setIsStreaming(false);
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ messages: [{ type: "human", content: input }] });
    setInput("");
  };

  const newChatHandler = () => {
    navigate.push(`/teams/${teamId}`);
    setMessages([]);
  };

  /**
   * Submit the interrupt decision and optional tool message
   */
  const onResumeHandler = (
    decision: InterruptDecision,
    tool_message?: string | null
  ) => {
    mutation.mutate({
      messages: [
        {
          type: "human",
          content: tool_message || decision,
        },
      ],
      interrupt: { decision, tool_message },
    });
  };

  return (
    <Box height="full">
      <InputGroup as="form" onSubmit={onSubmit}>
        <Input
          type="text"
          placeholder="Ask your team a question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <InputRightElement>
          <IconButton
            type="submit"
            icon={<VscSend />}
            aria-label="send-question"
            isLoading={isStreaming}
            isDisabled={!input.trim().length}
          />
        </InputRightElement>
      </InputGroup>
      <Box p={2} overflow={"auto"} height="72vh" my={2}>
        {messages.map((message, index) => (
          <MessageBox
            key={index}
            message={message}
            onResume={onResumeHandler}
          />
        ))}
      </Box>
      <Button
        leftIcon={<IoCreateOutline />}
        position={"fixed"}
        right={0}
        bottom={0}
        margin={8}
        onClick={newChatHandler}
      >
        New Chat
      </Button>
    </Box>
  );
};

export default ChatTeam;
