import React from 'react';
import { Box, InputGroup, Input, InputRightElement, IconButton, Tooltip } from '@chakra-ui/react';
import { VscSend } from 'react-icons/vsc';
import { GrNewWindow } from 'react-icons/gr';

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
  newChatHandler?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  onSubmit,
  isStreaming,
  newChatHandler
}) => (
  <Box
    display="flex"
    pl="10"
    pr="20"
    pt="5"
    pb="10"
    position="relative"
    justifyItems="center"
  >
    <InputGroup as="form" onSubmit={onSubmit}>
      <Input
        type="text"
        placeholder="Ask your team a question"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        boxShadow="0 0 10px rgba(0,0,0,0.2)"
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
    {newChatHandler && (
      <Tooltip
        label="New Chat"
        fontSize="md"
        bg="green"
        placement="top-end"
      >
        <IconButton
          aria-label="new chat"
          icon={<GrNewWindow />}
          position="absolute"
          right={10}
          onClick={newChatHandler}
          boxShadow="0 0 10px rgba(0,0,0,0.2)"
        />
      </Tooltip>
    )}
  </Box>
);

export default MessageInput;
