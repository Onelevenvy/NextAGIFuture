import {
  Box,
  Flex,
  Avatar,
  VStack,
  useColorModeValue,
  Link,
  Tooltip,
} from "@chakra-ui/react";

import SidebarItems from "./SidebarItems";
import { FaGithubSquare } from "react-icons/fa";

const Sidebar = () => {
  const bgColor = useColorModeValue("ui.white", "ui.dark");
  const secBgColor = useColorModeValue("ui.secondary", "ui.darkSlate");

  return (
    <>
      <Box bg={bgColor} p={1} h="100vh">
        <Flex
          flexDir="column"
          justify="space-between"
          bg={secBgColor}
          p={4}
          borderRadius={12}
          h="100%"
        >
          <Box w="full">
            <VStack align="center" spacing={6}>
              <Link
                href="https://github.com/Onelevenvy/NextAGIFuture"
                isExternal
              >
                <Tooltip
                  label="https://github.com/Onelevenvy/NextAGIFuture"
                  fontSize="2xs"
                >
                  <Avatar
                    size="md"
                    bg={"transparent"}
                    icon={<FaGithubSquare size={"40"} color="black" />}
                    mt={"12px"}
                  />
                </Tooltip>
              </Link>
              <Box>
                <SidebarItems />
              </Box>
            </VStack>
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default Sidebar;
