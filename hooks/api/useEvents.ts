import { toDateString } from "@/lib/utils";
import { useApi } from "@/hooks/api/useApi";
import { Task } from "@/app/api/events/day/[date]/route";

export const useEvents = (day: Date) => {
  const dateString = toDateString(day, "day");
  return useApi<Task[]>({
    key: ["/api/events/day", dateString],
    route: `/api/events/day/${dateString}`,
  });
};
