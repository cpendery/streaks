import { Task } from "@/app/api/events/day/[date]/route";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SetStateAction } from "react";
import { useCheckTask } from "@/hooks/useCheckTask";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";

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
  return (
    <div
      key={todo.uid}
      className="flex min-h-12 rounded border items-center justify-between"
    >
      <div className="flex items-center ml-2">
        <Checkbox
          className="ml-2"
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
            onClick={deleteTask}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
