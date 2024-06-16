import { Task } from "@/app/api/events/day/[date]/route";
import { useApi } from "@/hooks/api//useApi";

export const useTags = () => {
  return useApi<Task[]>({
    key: ["/api/events/tag"],
    route: `/api/events/tag/`,
  });
};
