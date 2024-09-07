import {
  Box,
  Icon,
  IconButton,
  Stack,
  useColorModeValue,
  useDisclosure,
  Text,
} from "@chakra-ui/react"
import type { NodeProps } from "reactflow"
import { Handle, Position } from "reactflow"
import type { MemberOut } from "../../../client"
import { FiEdit2 } from "react-icons/fi"
import { GrUserManager, GrUserWorker } from "react-icons/gr"
import LimitConnectionHandle from "../Handles/LimitConnectionHandle"
import  EditTeamMember  from "@/components/Members"

export type MemberNodeData = {
  teamId: number
  member: MemberOut
}

export function MemberNode({ data }: NodeProps<MemberNodeData>) {
  const editMemberModal = useDisclosure()
  const bgColor = useColorModeValue("gray.50", "ui.darkSlate")

  return (
    <Box w="15rem" p={2} boxShadow="base" borderRadius="lg" bgColor={bgColor}>
      <Stack direction="row" spacing={2} align="center" w="full">
        {data.member.type === "worker" ? (
          <Icon as={GrUserWorker} boxSize={5} color="gray.400" />
        ) : (
          <Icon as={GrUserManager} boxSize={5} color="gray.400" />
        )}
        <Stack spacing={0} w="70%">
          <Text fontWeight={"bold"} noOfLines={1}>
            {data.member.name}
          </Text>
          <Text fontSize={"x-small"} noOfLines={2}>
            {data.member.role}
          </Text>
        </Stack>
        <IconButton
          size="xs"
          aria-label="Edit Member"
          icon={<FiEdit2 />}
          onClick={editMemberModal.onOpen}
          variant="outline"
          colorScheme="blue"
        />
      </Stack>
      <EditTeamMember
        isOpen={editMemberModal.isOpen}
        onClose={editMemberModal.onClose}
        teamId={data.teamId}
        member={data.member}
      />
      <LimitConnectionHandle
        type="target"
        position={Position.Top}
        connectionLimit={1}
      />
      {data.member.type === "leader" && (
        <Handle type="source" position={Position.Bottom} />
      )}
    </Box>
  )
}
