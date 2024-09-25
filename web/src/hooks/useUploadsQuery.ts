import { UploadsService } from "@/client/services/UploadsService";
import { useQuery } from "react-query";

export function useUploadsQuery() {
  return useQuery(
    "uploads",
    () => UploadsService.readUploads({ status: "Completed" }),
    {
      staleTime: 1 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  );
}
