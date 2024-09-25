import { Box, Flex, Text } from "@chakra-ui/react";
import type { FC } from "react";

type Option = {
  value: string;
  text: string;
  icon?: React.ReactNode;
};

type TabSliderProps = {
  className?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
};

const TabSlider: FC<TabSliderProps> = ({
  className,
  value,
  onChange,
  options,
}) => {
  return (
    <Flex className={className} position="relative">
      {options.map((option, index) => (
        <Box
          key={option.value}
          onClick={() => onChange(option.value)}
          px={3}
          py={2}
          height="32px"
          display="flex"
          alignItems="center"
          borderRadius="md"
          borderWidth="1px"
          fontSize="14px"
          fontWeight="md"
          lineHeight="18px"
          cursor="pointer"
          bg={value === option.value ? "white" : "transparent"}
          borderColor={value === option.value ? "gray.200" : "transparent"}
          boxShadow={value === option.value ? "sm" : "none"}
          color={value === option.value ? "primary.600" : "gray.700"}
          _hover={{ bg: value === option.value ? "white" : "gray.200" }}
          marginRight={index < options.length - 1 ? "4px" : "0"} // 为最后一个元素设置 0 的 marginRight
        >
          {option.icon}
          <Text ml={2}>{option.text}</Text>
        </Box>
      ))}
    </Flex>
  );
};

export default TabSlider;
