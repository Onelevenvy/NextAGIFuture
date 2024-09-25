import { Icon, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
<InputGroup w={{ base: "100%", md: "auto" }}>
  <InputLeftElement pointerEvents="none">
    <Icon as={FaSearch} color="gray.400" />
  </InputLeftElement>
  <Input
    type="text"
    placeholder="Search"
    fontSize={{ base: "sm", md: "inherit" }}
    borderRadius="8px"
  />
</InputGroup>;
