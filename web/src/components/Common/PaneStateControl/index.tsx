import { Box } from "@chakra-ui/react";
import { LuChevronLeft } from "react-icons/lu";

interface PaneStateControlProps {
  selectedColor: string;
  onClick: () => void;
  background: string;
  Icon: React.ComponentType; // 传入的图标组件
}

const PaneStateControl: React.FC<PaneStateControlProps> = ({
  onClick,
  background,
  selectedColor,
  Icon,
}) => {
  return (
    <Box
      display="flex"
      w="16px"
      maxW={"16px"}
      h="32px"
      _hover={{ cursor: "pointer", backgroundColor: selectedColor }}
      justifyContent={"center"}
      alignItems={"center"}
      borderRadius="sm"
      onClick={onClick}
      background={background}
    >
      <Icon />
    </Box>
  );
};

export default PaneStateControl;
