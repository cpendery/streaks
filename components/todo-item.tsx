import { Task } from "@/app/api/events/day/[date]/route";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SetStateAction, useState } from "react";
import { useCheckTask } from "@/hooks/useCheckTask";
import { Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { DeleteEvent } from "./delete-event";
import { cn } from "@/lib/utils";

export const TodoItem = ({
  todo,
  setTodos,
  date,
}: {
  todo: Task;
  setTodos: (value: SetStateAction<Task[]>) => void;
  date: Date;
}) => {
  const checkTask = useCheckTask(todo, setTodos, date);
  const deleteTask = useDeleteTask(todo, setTodos, date);
  const [showDelete, setShowDelete] = useState(false);

  const onDeleteClick = () => {
    if (todo.sid != "") {
      setShowDelete(true);
    } else {
      deleteTask();
    }
  };

  return (
    <div
      key={todo.uid}
      className={cn(
        "flex min-h-12 rounded border items-center justify-between",
        todo.complete ? "bg-muted text-faint" : ""
      )}
    >
      <div className="flex items-center ml-2">
        <Checkbox
          className={cn(
            "ml-2",
            todo.complete
              ? "data-[state=checked]:bg-faint data-[state=checked]:border-transparent data-[state=checked]:hover:bg-primary"
              : ""
          )}
          checked={todo.complete}
          onClick={checkTask}
        />
        <span className="ml-2">{todo.name}</span>
      </div>
      <div className="flex items-center">
        {todo.tags.length != 0 && (
          <div className="flex">
            {todo.tags.map((tag, idx) => (
              <Badge className="mr-1" variant="secondary" key={idx}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="mr-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-10"
            onClick={onDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <DeleteEvent todo={todo} open={showDelete} setOpen={setShowDelete} />
        </div>
      </div>
    </div>
  );
};
