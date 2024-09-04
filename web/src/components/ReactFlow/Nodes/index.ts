import type { NodeTypes } from "reactflow";
import { MemberNode } from "./MemberNode";
import { RootNode } from "./RootNode";
import { FreelancerNode } from "./FreelancerNode";
import { ChatAndRAGBotNode } from "./ChatAndRagBotNode";

export const nodeTypes = {
  worker: MemberNode,
  leader: MemberNode,
  freelancer: FreelancerNode,
  freelancer_root: FreelancerNode,
  root: RootNode,
  chatbot: ChatAndRAGBotNode,
  ragbot: ChatAndRAGBotNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
