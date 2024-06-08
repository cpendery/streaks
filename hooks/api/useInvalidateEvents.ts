import { toDateString } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useInvalidateEvents = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (day?: Date) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "/api/events/day" &&
          (day != null ? query.queryKey[1] == toDateString(day, "day") : true),
      });
    },
    [queryClient]
  );
};
