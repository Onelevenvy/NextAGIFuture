import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Flex,
  Avatar,
  Text,
  MenuDivider,
  Button,
  useDisclosure,
} from "@chakra-ui/react";


import { useQueryClient } from "react-query";
import Link from "next/link";
import useAuth from "../../../hooks/useAuth";
import type { UserOut } from "../../../client";

import { ChevronDownIcon } from "@chakra-ui/icons";
import { forwardRef, BoxProps } from "@chakra-ui/react";
import CustomModalWrapper from "../CustomModal";
import AccountSetting from "@/components/Settings";
const UserMenu = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserOut>("currentUser");



  const { isOpen, onOpen, onClose } = useDisclosure();

  const tqxMenuComponent = forwardRef<BoxProps, "div">((props, ref) => (
    <Box
      rounded="full"
      cursor="pointer"
      transition="background-color 0.3s ease"
      _hover={{ backgroundColor: "gray.200" }}
      _active={{ backgroundColor: "gray.200" }}
      _focus={{ outline: "none" }}
      ref={ref}
      {...props}
    >
      <Flex alignItems="center">
        <Avatar
          size="md"
          name={currentUser?.full_name!}
          src=""
          m={"2px"}
          cursor="pointer"
        />

        <Button
          rightIcon={<ChevronDownIcon />}
          maxWidth="100%"
          bg={"transparent"}
          _hover={{ bg: "transparent" }}
          _active={{ bg: "transparent" }}
          _focus={{ outline: "none" }}
        >
          {currentUser?.full_name!}
        </Button>
      </Flex>
    </Box>
  ));

  return (
    <>
      <Box display="flex" w="full" ml={"auto"}>
        <Box ml="auto">
          <Menu autoSelect={false}>
            <MenuButton as={tqxMenuComponent} />
            <MenuList>
              <Flex alignItems="center" mb={2}>
                <Avatar
                  size="sm"
                  name={currentUser?.full_name!}
                  src=""
                  m={"10px"}
                />
                <Box>
                  <Text fontWeight="bold">{currentUser?.full_name}</Text>
                  <Text fontSize="sm">{currentUser?.email}</Text>
                </Box>
              </Flex>
              <MenuDivider />

              <MenuItem as={Link} href="" onClick={onOpen}>
                设置
                <CustomModalWrapper
                  component={<AccountSetting />}
                  size="6xl"
                  isOpen={isOpen}
                  onClose={onClose}
                />
              </MenuItem>

              <MenuItem as={Link} href="">
                帮助文档
              </MenuItem>
              <MenuItem as={Link} href="">
                About
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>登出</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default UserMenu;
