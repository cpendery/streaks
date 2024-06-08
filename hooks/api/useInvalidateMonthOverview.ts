import { toDateString } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useInvalidateMonthOverview = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (month?: Date) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/events/month" &&
          (month != null
            ? query.queryKey[1] == toDateString(month, "month")
            : true),
      });
    },
    [queryClient]
  );
};
