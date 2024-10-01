import {
  Box,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tooltip,
  Image,
  Flex,
  CloseButton,
  HStack,
} from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import { GrNewWindow } from "react-icons/gr";
import { RiImageAddLine } from "react-icons/ri";
import { VscSend } from "react-icons/vsc";
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
  newChatHandler,
}) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData!(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeImage = () => {
    setImageData!(null);
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column" // 垂直排列
      pl="10"
      pr="20"
      pt="2"
      pb="10"
      position="relative"
    >
      {/* 图片预览区域 */}
      {imageData && (
        <Flex alignItems="center" mb={2}>
          <Image
            src={imageData}
            alt="Uploaded preview"
            boxSize="60px"
            borderRadius="md"
            objectFit="cover"
            mr={2}
          />
          <CloseButton onClick={removeImage} variant="outline" size="sm" />
        </Flex>
      )}
      <HStack>
        <InputGroup as="form" onSubmit={onSubmit}>
          <Input
            type="text"
            placeholder="Ask your team a question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            boxShadow="0 0 10px rgba(0,0,0,0.2)"
            pr={imageData ? "40px" : "0"} // 调整右侧内边距
          />
          <InputRightElement>
            <IconButton
              type="submit"
              icon={<VscSend />}
              aria-label="send-question"
              isLoading={isStreaming}
              isDisabled={!input.trim().length && !imageData}
            />
          </InputRightElement>
          <InputLeftElement>
            <IconButton
              type="button"
              id="image-upload"
              icon={<RiImageAddLine />}
              aria-label="upload-image"
              onClick={() => document.getElementById("file-input")?.click()}
            />
            <input
              type="file"
              id="file-input"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </InputLeftElement>
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
      </HStack>
    </Box>
  );
};

export default MessageInput;
