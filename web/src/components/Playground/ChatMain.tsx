import { Box } from "@chakra-ui/react";
import useChatMessageStore from "@/store/chatMessageStore";
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
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useRouter, useSearchParams } from "next/navigation";
import MessageBox from "./MessageBox";
import MessageInput from "../MessageInput";
import useChatTeamIdStore from "@/store/chatTeamIDStore";

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

const ChatMain = ({ isPlayground }: { isPlayground?: boolean }) => {
  const queryClient = useQueryClient();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId");

  const { teamId } = useChatTeamIdStore() as { teamId: string };

  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const showToast = useCustomToast();
  const [input, setInput] = useState("");
  const { messages, setMessages } = useChatMessageStore();
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
        if (isPlayground) {
          navigate.push(`/playground?teamId=${teamId}`);
          setMessages([]);
        } else {
          navigate.push(`/teams/${teamId}`);
          setMessages([]);
        }
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
      if (isPlayground) {
        navigate.push(`/playground?teamId=${teamId}&threadId=${threadId}`);
      } else {
        navigate.push(`/teams/${teamId}?threadId=${threadId}`);
      }
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
    setMessages((prevMessages: ChatResponse[]) => {
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

    setMessages((prev: ChatResponse[]) => [
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
      // showToast("Streaming completed", "", "success");
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
    if (isPlayground) {
      navigate.push(`/playground?teamId=${teamId}`);
      setMessages([]);
    } else {
      navigate.push(`/teams/${teamId}`);
      setMessages([]);
    }
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
    <Box
      height="full"
      maxH="full"
      w="full"
      maxW="full"
      display="flex"
      flexDirection="column"
      position={"relative"}
    >
      <Box
        p={2}
        overflowY={"auto"}
        overflowX="hidden"
        h="full"
        maxH="full"
        w="full"
        maxW="full"
      >
        {messages.map((message, index) => (
          <MessageBox
            key={index}
            message={message}
            onResume={onResumeHandler}
          />
        ))}
      </Box>

      <MessageInput
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
        isStreaming={isStreaming}
        newChatHandler={newChatHandler}
      />
    </Box>
  );
};

export default ChatMain;
