import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useInvalidateStreak = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === "/api/events/streak",
    });
  }, [queryClient]);
};
