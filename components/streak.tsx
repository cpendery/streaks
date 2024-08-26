import { useEvents } from "@/hooks/api/useEvents";
import { useStreak } from "@/hooks/api/useStreak";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

export const Streak = () => {
  const t = new Date();
  const date = new Date(t.getFullYear(), t.getMonth(), t.getDate());

  const { data: events } = useEvents(date);
  const complete = events.every((e) => e.complete) && events.length > 0;

  const { data: streakLength } = useStreak(date);

  return (
    <div
      className={cn(
        "flex",
        complete ? "text-success-foreground" : "text-dim-foreground"
      )}
    >
      <Flame />
      {streakLength}
    </div>
  );
};
