import React from "react";
import { Box, Text, Textarea } from "@chakra-ui/react";
import BaseProperties from "../Base/Properties";


interface EndNodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const EndNodeProperties: React.FC<EndNodePropertiesProps> = ({ node, onNodeDataChange }) => {
  return (
    <BaseProperties>
      <Box>
        <Text fontWeight="bold">Final Output:</Text>
        <Textarea
          value={node.data.finalOutput}
          onChange={(e) => onNodeDataChange(node.id, 'finalOutput', e.target.value)}
          placeholder="Final output will be displayed here"
          isReadOnly
        />
      </Box>
    </BaseProperties>
  );
};

export default EndNodeProperties;