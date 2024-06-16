"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState } from "@/state/atoms";
import { Calendar as Cal } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { AddEvent } from "@/components/add-event";
import { Trash2 } from "lucide-react";
import { useMonthOverview } from "@/hooks/api/useMonthOverview";
import { useInvalidateMonthOverview } from "@/hooks/api/useInvalidateMonthOverview";
import { useEvents } from "@/hooks/api/useEvents";
import { useInvalidateEvents } from "@/hooks/api/useInvalidateEvents";
import { apiAction, apiMutation } from "@/lib/api";
import { Task } from "@/app/api/events/day/[date]/route";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import Image from "next/image";

function Login() {
  const [password, setPassword] = useState("");
  const setAuth = useSetRecoilState(authState);
  const { mutate, isPending } = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiMutation({
        route: "/api/user/login",
        method: "POST",
        body: { password },
      });
      if (!response.ok) {
        toast.error("failed to login");
      } else {
        const { token } = (await response.json()) as { token: string };
        localStorage.setItem("jwt", token);
        toast.success("successfully logged in");
        setAuth(true);
      }
    },
  });

  return (
    <form
      className="flex h-full items-center justify-center"
      onSubmit={(e) => {
        e.preventDefault();
        mutate(password);
      }}
    >
      <div className="flex sm:w-fit w-full justify-center sm:min-w-[50%] mx-4">
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />{" "}
        <Button className="ml-4" type="submit">
          {isPending ? (
            <Loader2 className="h-4 w-4 mx-2 animate-spin" />
          ) : (
            "Login"
          )}
        </Button>
      </div>
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
  const [month, setMonth] = useState(new Date());
  const invalidateMonthOverview = useInvalidateMonthOverview();
  const { data: monthOverview } = useMonthOverview(month);
  const overview = monthOverview ?? {};
  const onMonthChange = useCallback(
    (month: Date) => {
      setMonth(month);
      invalidateMonthOverview(month);
    },
    [invalidateMonthOverview]
  );

  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const dateString = date.toDateString();

  const selectedOverview = overview[`${date.getDate()}`];
  const selectedComplete =
    selectedOverview != null &&
    selectedOverview.complete === selectedOverview.total;
  const selectedIncomplete =
    selectedOverview != null &&
    selectedOverview.complete !== selectedOverview.total;

  const completeSelected = selectedComplete ? [date] : [];
  const completeDays = Object.keys(overview)
    .filter(
      (day) =>
        overview[day]?.complete === overview[day]?.total &&
        overview[day] != null
    )
    .map((day) => new Date(date.getFullYear(), date.getMonth(), parseInt(day)))
    .filter((day) => day.toDateString() != dateString);

  console.log(completeDays, date);

  const incompleteDays = Object.keys(overview)
    .filter(
      (day) =>
        overview[day]?.complete !== overview[day]?.total &&
        overview[day] != null
    )
    .map((day) => new Date(date.getFullYear(), date.getMonth(), parseInt(day)));

  const failedDays = incompleteDays.filter(
    (day) => day < today && day.toDateString() != dateString
  );
  const failedSelected = selectedIncomplete && date < today ? [date] : [];
  const upcomingDays = incompleteDays.filter(
    (day) => day > today && day.toDateString() != dateString
  );
  const upcomingSelected = selectedIncomplete && date > today ? [date] : [];

  return (
    <div>
      <div className="hidden sm:block">
        <Cal
          mode="single"
          selected={date}
          onSelect={setDate as any} // ignore the undefined since its set as required
          month={month}
          onMonthChange={onMonthChange}
          modifiers={{
            complete: completeDays,
            completeSelected: completeSelected,
            upcoming: upcomingDays,
            upcomingSelected: upcomingSelected,
            failed: failedDays,
            failedSelected: failedSelected,
          }}
          modifiersClassNames={{
            complete:
              "bg-success text-success-foreground hover:bg-success-accent hover:text-success-foreground font-extrabold",
            completeSelected:
              "font-extrabold bg-success-foreground hover:bg-success-foreground focus:bg-success-foreground",
            upcoming:
              "bg-info text-info-foreground hover:bg-info-accent hover:text-info-foreground font-extrabold",
            upcomingSelected:
              "font-extrabold text-background bg-info-foreground hover:bg-info-foreground focus:bg-info-foreground",
            failed:
              "bg-error text-error-foreground hover:bg-error-accent hover:text-error-foreground font-extrabold",
            failedSelected:
              "font-extrabold text-background bg-error-foreground hover:bg-error-foreground focus:bg-error-foreground",
          }}
          required
        />
      </div>
      <div className="[&>button]:w-full sm:hidden">
        <DatePicker
          label="Select day"
          date={date}
          setDate={setDate}
          month={month}
          onMonthChange={onMonthChange}
          modifiers={{
            complete: completeDays,
            completeSelected: completeSelected,
            upcoming: upcomingDays,
            upcomingSelected: upcomingSelected,
            failed: failedDays,
            failedSelected: failedSelected,
          }}
          modifiersClassNames={{
            complete:
              "bg-success text-success-foreground hover:bg-success-accent hover:text-success-foreground font-extrabold",
            completeSelected:
              "font-extrabold bg-success-foreground hover:bg-success-foreground focus:bg-success-foreground",
            upcoming:
              "bg-info text-info-foreground hover:bg-info-accent hover:text-info-foreground font-extrabold",
            upcomingSelected:
              "font-extrabold text-background bg-info-foreground hover:bg-info-foreground focus:bg-info-foreground",
            failed:
              "bg-error text-error-foreground hover:bg-error-accent hover:text-error-foreground font-extrabold",
            failedSelected:
              "font-extrabold text-background bg-error-foreground hover:bg-error-foreground focus:bg-error-foreground",
          }}
        />
      </div>
    </div>
  );
}

function TodoList({ date }: { date: Date }) {
  const { data: todoData } = useEvents(date);
  const invalidateMonthOverview = useInvalidateMonthOverview();
  const invalidateEvents = useInvalidateEvents();
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
      await apiAction({
        route: `/api/events/check/${todo.uid}`,
        method: "POST",
        body: { complete: !todo.complete },
      });
      invalidateMonthOverview(date);
    },
    [date, invalidateMonthOverview, todos]
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
                const ok = await apiAction({
                  route: `/api/events/${todo.uid}`,
                  method: "DELETE",
                });
                if (ok) {
                  toast.success(`Successfully deleted event: ${todo.name}`);
                  invalidateMonthOverview(date);
                } else {
                  toast.error(`Failed to delete: ${todo.name}`);
                  invalidateEvents(date);
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
  const t = new Date();
  const [date, setDate] = useState<Date>(
    new Date(t.getFullYear(), t.getMonth(), t.getDate())
  );

  return (
    <div className="flex flex w-full mt-4 flex-col sm:flex-row">
      <div className="flex flex-col space-y-4 m-4">
        <AddEvent />
        <Suspense fallback={<Skeleton className="h-[360px] w-[360px]" />}>
          <Calendar date={date} setDate={setDate} />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="h-full w-full space-y-2 mt-12 overflow-hidden sm:max-h-[calc(100vh-48px-16px)] max-h-[calc(100vh-132px-48px-16px)]">
            {[...new Array(100)].map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full block" />
            ))}
          </div>
        }
      >
        <div className="flex flex-col grow m-4">
          <div className="flex justify-end m-4"></div>
          <TodoList date={date} />
        </div>
      </Suspense>
    </div>
  );
}

export default function Home() {
  // useAuth();
  // const authenticated = useRecoilValue(authState);

  useEffect(() => {
    window.addEventListener("mousemove", (e) => {
      const elem = document.createElement("img");
      elem.className = "cursor-friend";
      elem.style.top = `${e.clientY}px`;
      elem.style.left = `${e.clientX}px`;
      elem.src = "/friend.png";
      elem.height = 512;
      elem.width = 512;
      const cursorFriends = document.getElementById("cursor-friends");
      cursorFriends?.appendChild(elem);
      setTimeout(() => cursorFriends?.removeChild(elem), 2_500);
    });
  });

  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full min-h-screen">
        {/* {authenticated === false && <Login />}
        {authenticated === true && <Day />}
        {authenticated == null && (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
          </div>
        )} */}
        <div className="w-full h-full flex flex-col justify-center items-center relative">
          <Image
            src={`/pending.jpg`}
            alt={"a cute fox holding a present pixel"}
            width={1024}
            height={1024}
            style={{ width: "auto", height: "100%" }}
          />
          <div className="mb-16">
            gift under construction, updates forthcoming
          </div>
        </div>
      </div>
      <div
        id="cursor-friends"
        className="overflow-hidden h-screen w-screen absolute"
      />
      <Toaster />
    </main>
  );
}
