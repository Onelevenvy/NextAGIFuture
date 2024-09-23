import { useQuery } from "react-query";
import { GraphsService } from "@/client/services/GraphsService";

export function useGraphsQuery(teamId:number) {
  return useQuery("graphs", () => GraphsService.readGraphs({ teamId:teamId }), {
    enabled: !!teamId,
  });
}
