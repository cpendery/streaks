import { toDateString } from "@/lib/utils";
import { Task } from "@/app/api/events/day/[date]/route";
import { useSuspenseApi } from "@/hooks/api/useSuspenseApi";

export const useEvents = (day: Date) => {
  const dateString = toDateString(day, "day");
  return useSuspenseApi<Task[]>({
    key: ["/api/events/day", dateString],
    route: `/api/events/day/${dateString}`,
  });
};
