import { Task } from "@/app/api/events/day/[date]/route";
import { apiAction } from "@/lib/api";
import { SetStateAction } from "react";
import { useInvalidateMonthOverview } from "@/hooks/api/useInvalidateMonthOverview";

export const useCheckTask = (
  todo: Task,
  setTodos: (value: SetStateAction<Task[]>) => void,
  date: Date
) => {
  const invalidateMonthOverview = useInvalidateMonthOverview();

  return async () => {
    setTodos((todos) => [
      ...todos.map((t) =>
        t.uid != todo.uid ? t : { ...t, complete: !t.complete }
      ),
    ]);
    await apiAction({
      route: `/api/events/check/${todo.uid}`,
      method: "POST",
      body: { complete: !todo.complete },
    });
    invalidateMonthOverview(date);
  };
};
