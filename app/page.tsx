"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState } from "@/state/atoms";
import { useApi } from "@/hooks/useApi";
import { toDateString } from "@/lib/utils";
import { Calendar as Cal } from "@/components/ui/calendar";
import { MonthOverview } from "@/app/api/events/month/[date]/route";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useSWRConfig } from "swr";
import { AddEvent } from "@/components/add-event";
import { Trash2 } from "lucide-react";

function Login() {
  const [password, setPassword] = useState("");
  const setAuth = useSetRecoilState(authState);
  const login = useCallback(() => {
    fetch("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }).then(async (response) => {
      if (!response.ok) {
        toast.error("failed to login");
      } else {
        const { token } = (await response.json()) as { token: string };
        localStorage.setItem("jwt", token);
        toast.success("successfully logged in");
        setAuth(true);
      }
    });
  }, [password, setAuth]);

  return (
    <form
      className="flex"
      onSubmit={(e) => {
        e.preventDefault();
        login();
      }}
    >
      <Input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />{" "}
      <Button className="ml-4" type="submit">
        Login
      </Button>
    </form>
  );
}

function Calendar({
  date,
  setDate,
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const overview = useApi<MonthOverview>(
    `/api/events/month/${toDateString(date, "month")}`,
    { suspense: true }
  ).data as MonthOverview;

  const today = new Date();
  const todayString = today.toDateString();

  const todaySelected = date.toDateString() == todayString;
  const todayOverview = overview[`${today.getDate()}`];
  const selectedOverview = overview[`${date.getDate()}`];
  const todayComplete =
    todayOverview != null && todayOverview.complete === todayOverview.total;
  const selectedComplete =
    selectedOverview != null &&
    selectedOverview.complete === selectedOverview.total;

  const completeToday = !todaySelected && todayComplete ? [today] : [];
  const completeTodaySelected = todaySelected && todayComplete ? [today] : [];
  const completeSelected = !todaySelected && selectedComplete ? [date] : [];
  const completeDays = (
    date != null
      ? Object.keys(overview)
          .filter(
            (day) =>
              overview[day]?.complete === overview[day]?.total &&
              overview[day] != null
          )
          .map(
            (day) =>
              new Date(date.getFullYear(), date.getMonth(), parseInt(day))
          )
      : []
  ).filter(
    (day) =>
      day.toDateString() != todayString &&
      day.toDateString() != date.toDateString()
  );

  return (
    <div>
      <Cal
        mode="single"
        selected={date}
        onSelect={setDate as any} // ignore the undefined since its set as required
        modifiers={{
          complete: completeDays,
          completeToday: completeToday,
          completeTodaySelected: completeTodaySelected,
          completeSelected: completeSelected,
        }}
        modifiersClassNames={{
          complete:
            "bg-success text-success-foreground hover:bg-success-accent hover:text-success-foreground font-extrabold",
          completeToday:
            "bg-success text-success-foreground hover:bg-success-accent hover:text-success-foreground underline underline-offset-2 font-extrabold",
          completeSelected:
            "font-extrabold bg-success-foreground hover:bg-success-foreground focus:bg-success-foreground",
          completeTodaySelected:
            "font-extrabold bg-success-foreground hover:bg-success-foreground focus:bg-success-foreground underline underline-offset-2",
        }}
        required
      />
    </div>
  );
}

type Task = {
  complete: boolean;
  name: string;
  uid: string;
};

function TodoList({ date }: { date: Date }) {
  const { data: todoData, mutate } = useApi<Task[]>(
    `/api/events/day/${toDateString(date, "day")}`,
    {
      suspense: true,
    }
  );
  const { mutate: globalMutate } = useSWRConfig();
  const [todos, setTodos] = useState<Task[]>([]);
  useEffect(() => {
    if (todoData) setTodos(todoData);
  }, [todoData]);

  const onCheck = useCallback(
    async (todo: Task) => {
      setTodos([
        ...todos.map((t) =>
          t.uid != todo.uid ? t : { ...t, complete: !t.complete }
        ),
      ]);
      const jwt = localStorage.getItem("jwt") ?? "";
      await fetch(`/api/events/check/${todo.uid}`, {
        body: JSON.stringify({ complete: !todo.complete }),
        headers: { Authorization: `Bearer ${jwt}` },
        method: "POST",
      });
      mutate();
      globalMutate(`/api/events/month/${toDateString(date, "month")}`);
    },
    [date, globalMutate, mutate, todos]
  );

  return (
    <div className="flex grow flex-col space-y-2 mx-4">
      {(todos ?? []).map((todo) => (
        <div
          key={todo.uid}
          className="flex min-h-12 rounded border items-center justify-between"
        >
          <div className="flex items-center ml-2">
            <Checkbox
              className="ml-2"
              checked={todo.complete}
              onClick={async () => await onCheck(todo)}
            />
            <span className="ml-2">{todo.name}</span>
          </div>
          <div className="mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                setTodos([...todos.filter((t) => t.uid != todo.uid)]);
                const jwt = localStorage.getItem("jwt") ?? "";
                const response = await fetch(`/api/events/${todo.uid}`, {
                  headers: { Authorization: `Bearer ${jwt}` },
                  method: "DELETE",
                });
                if (response.ok) {
                  toast.success(`Successfully deleted event: ${todo.name}`);
                  globalMutate(
                    `/api/events/month/${toDateString(date, "month")}`
                  );
                } else {
                  toast.error(`Failed to delete: ${todo.name}`);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Day() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="flex flex w-full mt-4 flex-col sm:flex-row">
      <div className="flex flex-col space-y-4 m-4">
        <AddEvent />
        <Suspense fallback={<Skeleton className="h-[360px] w-[360px]" />}>
          <Calendar date={date} setDate={setDate} />
        </Suspense>
      </div>
      <Suspense fallback={<div className="grow"></div>}>
        <div className="flex flex-col grow m-4">
          <div className="flex justify-end m-4"></div>
          <TodoList date={date} />
        </div>
      </Suspense>
    </div>
  );
}

export default function Home() {
  useAuth();
  const authenticated = useRecoilValue(authState);

  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full">
        {authenticated === false ? <Login /> : <Day />}
      </div>
      <Toaster />
    </main>
  );
}
