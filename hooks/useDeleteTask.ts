import { apiAction } from "@/lib/api";
import { toast } from "sonner";
import { useInvalidateMonthOverview } from "@/hooks/api/useInvalidateMonthOverview";
import { useInvalidateEvents } from "@/hooks/api/useInvalidateEvents";
import { SetStateAction } from "react";
import { Task } from "@/app/api/events/day/[date]/route";
import { EventsDeleteRequest } from "@/app/api/events/[id]/route";

export const useDeleteTask = (
  todo: Task,
  setTodos: (value: SetStateAction<Task[]>) => void,
  date: Date
) => {
  const invalidateMonthOverview = useInvalidateMonthOverview();
  const invalidateEvents = useInvalidateEvents();

  return async () => {
    setTodos((todos) => [...todos.filter((t) => t.uid != todo.uid)]);
    const body: EventsDeleteRequest = {
      sid: "",
      mode: "this",
    };
    const ok = await apiAction({
      route: `/api/events/${todo.uid}`,
      method: "DELETE",
      body,
    });
    if (ok) {
      toast.success(`Successfully deleted event: ${todo.name}`);
      invalidateMonthOverview(date);
    } else {
      toast.error(`Failed to delete: ${todo.name}`);
      invalidateEvents(date);
    }
  };
};
