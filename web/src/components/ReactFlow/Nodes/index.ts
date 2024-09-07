import type { NodeTypes } from "reactflow";
import { MemberNode } from "./MemberNode";
import { RootNode } from "./RootNode";
import { FreelancerNode } from "./FreelancerNode";

export const nodeTypes = {
  worker: MemberNode,
  leader: MemberNode,
  freelancer: FreelancerNode,
  freelancer_root: FreelancerNode,
  root: RootNode,
} satisfies NodeTypes;
