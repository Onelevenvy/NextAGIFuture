import { Box, Image, Text } from "@chakra-ui/react";

export function FlockLogo() {
  return (
    <Box
      display="flex"
      flexDirection={"row"}
      alignItems={"center"}
      justifyItems={"center"}
    >
      <Image src="logo.png" h={"55px"} w={"55px"} alt="Logo" bg="transparent" />
      <Text fontSize="2xl" fontWeight="bold">
        Flock
      </Text>
    </Box>
  );
}
