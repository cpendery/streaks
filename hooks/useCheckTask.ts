import { Task } from "@/app/api/events/day/[date]/route";
import { apiAction } from "@/lib/api";
import { SetStateAction } from "react";
import { useInvalidateMonthOverview } from "@/hooks/api/useInvalidateMonthOverview";
import { useInvalidateEvents } from "@/hooks/api/useInvalidateEvents";
import { useInvalidateStreak } from "@/hooks/api/useInvalidateStreak";

export const useCheckTask = (
  todo: Task,
  setTodos: (value: SetStateAction<Task[]>) => void,
  date: Date
) => {
  const invalidateMonthOverview = useInvalidateMonthOverview();
  const invalidateEvents = useInvalidateEvents();
  const invalidateStreak = useInvalidateStreak();

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
    invalidateEvents(date);
    invalidateStreak();
  };
};
