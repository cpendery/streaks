import { toDateString } from "@/lib/utils";
import { useApi } from "@/hooks/api/useApi";

export const useStreak = (date: Date) => {
  const dateString = toDateString(date, "day");
  return useApi<number>({
    key: ["/api/events/streak", dateString],
    route: `/api/events/streak?date=${dateString}`,
  });
};
