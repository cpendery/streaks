import { Task } from "@/app/api/events/day/[date]/route";
import { TodoItem } from "./todo-item";
import { useEffect, useState } from "react";
import { useEvents } from "@/hooks/api/useEvents";

export const TodoList = ({ date }: { date: Date }) => {
  const { data: todoData } = useEvents(date);
  const [todos, setTodos] = useState<Task[]>([]);

  useEffect(() => {
    if (todoData) setTodos(todoData);
  }, [todoData]);

  return (
    <div className="flex grow flex-col space-y-2 mx-4">
      {(todos ?? []).map((todo) => (
        <TodoItem key={todo.uid} todo={todo} setTodos={setTodos} date={date} />
      ))}
    </div>
  );
};
