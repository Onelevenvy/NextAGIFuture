import { Box } from "@chakra-ui/react";
import { NextAGILogo } from "./Logo";
import UserMenu from "./UserMenu";

export default function TopBar() {
  return (
    <Box display="flex" flexDirection={"row"} justifyContent={"space-between"}>
      <Box my="2" mx={5}>
        <NextAGILogo />
      </Box>
      <Box my="2" mx={2}>
        <UserMenu />
      </Box>
    </Box>
  );
}
