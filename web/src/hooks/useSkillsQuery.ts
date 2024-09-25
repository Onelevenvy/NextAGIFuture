import { SkillsService } from "@/client/services/SkillsService";
import { useQuery } from "react-query";

export function useSkillsQuery() {
  return useQuery("skills", () => SkillsService.readSkills({}), {
    staleTime: 1 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
