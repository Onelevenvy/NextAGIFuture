import { Box, Flex, Avatar, VStack, useColorModeValue } from "@chakra-ui/react";

import SidebarItems from "./SidebarItems";

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
              <Avatar size="sm" name="tqx" src="logo.svg" mt={"12px"} />
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
