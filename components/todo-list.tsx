import { Task } from "@/app/api/events/day/[date]/route";
import { TodoItem } from "./todo-item";
import { useEffect, useState } from "react";
import { useEvents } from "@/hooks/api/useEvents";
import Image from "next/image";
import { fireConfetti } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const TodoList = ({ date }: { date: Date }) => {
  const { data: todoData } = useEvents(date);
  const [todos, setTodos] = useState<Task[]>([]);
  const [hasShotConfetti, setHasShotConfetti] = useState(true);

  useEffect(() => {
    if (todoData) {
      setTodos(todoData.sort((a, b) => a.name.localeCompare(b.name)));
    }
    if (
      todoData.length > 0 &&
      todoData.find((todo) => !todo.complete) != null
    ) {
      setHasShotConfetti(false);
    }
  }, [todoData]);

  useEffect(() => {
    if (
      todos.every((todo) => todo.complete) &&
      !hasShotConfetti &&
      todos.length > 0
    ) {
      fireConfetti();
      setHasShotConfetti(true);
    }
  }, [hasShotConfetti, todos]);

  const pendingTodos = todos.filter((todo) => !todo.complete);
  const completeTodos = todos.filter((todo) => todo.complete);

  return (
    <div className="flex grow flex-col space-y-2 mx-4">
      {(pendingTodos ?? []).map((todo) => (
        <TodoItem key={todo.uid} todo={todo} setTodos={setTodos} date={date} />
      ))}

      {todos.length == 0 && (
        <div className="flex flex-col grow items-center justify-center">
          <Image
            src={`/sleepy.jpg`}
            alt={"a cute fox napping on a pillow"}
            width={1024}
            height={1024}
            style={{ width: "75%", maxWidth: "512px" }}
          />
          <p>nothing to do today but rest...</p>
        </div>
      )}
      {todos.length != 0 && pendingTodos.length == 0 && (
        <div className="flex flex-col grow items-center justify-center">
          <Image
            src={`/sleepy.jpg`}
            alt={"a cute fox napping on a pillow"}
            width={1024}
            height={1024}
            style={{ width: "75%", maxWidth: "512px" }}
          />
          <p>everything done, time to rest...</p>
        </div>
      )}
      {completeTodos.length != 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="completed">
            <AccordionTrigger>Completed</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {completeTodos.map((todo) => (
                  <TodoItem
                    key={todo.uid}
                    todo={todo}
                    setTodos={setTodos}
                    date={date}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};
