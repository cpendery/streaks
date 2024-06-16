import { Task } from "@/app/api/events/day/[date]/route";
import { useApi } from "@/hooks/api//useApi";

export const useEventTags = (eventId: string) => {
  return useApi<Task[]>({
    key: ["/api/events/tag", eventId],
    route: `/api/events/tag/${eventId}`,
  });
};
