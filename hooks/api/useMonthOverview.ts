import { MonthOverview } from "@/app/api/events/month/[date]/route";
import { toDateString } from "@/lib/utils";
import { useApi } from "@/hooks/api/useApi";

export const useMonthOverview = (month: Date) => {
  const dateString = toDateString(month, "month");
  return useApi<MonthOverview>({
    key: ["/api/events/month", dateString],
    route: `/api/events/month/${dateString}`,
  });
};
