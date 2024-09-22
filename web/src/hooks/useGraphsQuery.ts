import { useQuery } from "react-query";
import { GraphsService } from "@/client/services/GraphsService";

export function useGraphsQuery(teamId:string) {
  return useQuery("graphs", () => GraphsService.readGraphs({ teamId: Number.parseInt(teamId) }), {
    enabled: !!teamId,
  });
}
