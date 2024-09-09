import { useParams } from "next/navigation";
import { useQuery } from "react-query";
import { ApiError, MembersService } from "@/client";
import {
  Box,
  Button,
  Icon,
  IconButton,
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
} from "@chakra-ui/react";
import { useRef } from "react";

import { MdBuild } from "react-icons/md";
import { ImHistory } from "react-icons/im";
import ChatHistoryList from "@/components/Playground/ChatHistoryList";

function DebugPreviewHead({
  teamId,
  triggerSubmit,
}: {
  teamId: string;
  triggerSubmit: () => void;
}) {
  const bgColor = useColorModeValue("ui.bgMain", "ui.bgMainDark");
  const buttonColor = useColorModeValue("ui.main", "ui.main");
  // const formRef = useRef<HTMLFormElement>(null);
  // const triggerSubmit = () => {
  //   if (formRef.current) {
  //     formRef.current.requestSubmit();
  //   }
  // };

  return (
    <Box
      display={"flex"}
      flexDirection={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
      border={"1px solid red"}
    >
      <Text mt="5" ml="5" fontSize={"xl"} fontWeight={"bold"}>
        调试预览
      </Text>
      <Box
        display={"flex"}
        flexDirection={"row"}
        mt="5"
        mr="5"
        alignItems={"center"}
      >
        <Popover preventOverflow={false} isLazy={true}>
          {/* {Todo: 需要修改chathistory组件，现在点击会跳转到playground，需要改成根据情况而定 team or playground} */}
          <PopoverTrigger>
            <IconButton
              aria-label="history"
              icon={<Icon as={ImHistory} h="6" w="6" color={buttonColor} />}
              h="10"
              w="10"
              bg={bgColor}
              as={"button"}
            />
          </PopoverTrigger>
          <PopoverContent zIndex="9999" bg={"white"}>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>聊天记录</PopoverHeader>
            <PopoverBody
              maxH="50vh"
              overflowY="auto"
              zIndex="9999"
              bg={"white"}
            >
              <Box zIndex="1001">
                <ChatHistoryList teamId={teamId} />
              </Box>
            </PopoverBody>
            <PopoverFooter />
          </PopoverContent>
        </Popover>

        <Button
          ml={"5"}
          bg={buttonColor}
          borderRadius={"md"}
          onClick={triggerSubmit}
          _hover={{ backgroundColor: "#1c86ee" }}
          rightIcon={<MdBuild color={"white"} />}
        >
          <Text color={"white"}>发布</Text>
        </Button>
      </Box>
    </Box>
  );
}

export default DebugPreviewHead;
