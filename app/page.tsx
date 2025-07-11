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
import { AddEvent } from "@/components/add-event";
import { useMonthOverview } from "@/hooks/api/useMonthOverview";
import { useInvalidateMonthOverview } from "@/hooks/api/useInvalidateMonthOverview";
import { apiMutation } from "@/lib/api";
import {
  Loader2Icon,
  CalendarIcon,
  ChartSplineIcon,
  Eye,
  EyeOff,
  NotepadTextIcon,
  MapIcon,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import { TodoList } from "@/components/todo-list";
import { Streak } from "@/components/streak";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useCursorFriends } from "@/hooks/useCursorFriends";

function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="flex sm:w-fit w-full justify-center items-end sm:min-w-[50%] mx-4">
        <div className="flex flex-col sm:min-w-[50%]">
          <div className="flex w-full justify-end mb-1">
            <button
              type="button"
              className="text-[#086fff] text-xs flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <>
                  <EyeOff size={16} /> <span className="ml-0.5">Hide</span>
                </>
              ) : (
                <>
                  <Eye size={16} /> <span className="ml-0.5">Show</span>
                </>
              )}
            </button>
          </div>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
          />{" "}
        </div>
        <Button className="ml-4" type="submit">
          {isPending ? (
            <Loader2Icon className="h-4 w-4 mx-2 animate-spin" />
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

  useEffect(() => {
    onMonthChange(date);
  }, [date, onMonthChange]);

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
    .map((day) => new Date(date.getFullYear(), month.getMonth(), parseInt(day)))
    .filter((day) => day.toDateString() != dateString);

  const incompleteDays = Object.keys(overview)
    .filter(
      (day) =>
        overview[day]?.complete !== overview[day]?.total &&
        overview[day] != null
    )
    .map(
      (day) => new Date(date.getFullYear(), month.getMonth(), parseInt(day))
    );

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
      <div className="hidden md:block">
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
              "font-extrabold text-background !bg-info-foreground hover:bg-info-foreground focus:bg-info-foreground",
            failed:
              "bg-error text-error-foreground hover:bg-error-accent hover:text-error-foreground font-extrabold",
            failedSelected:
              "font-extrabold text-background !bg-error-foreground hover:bg-error-foreground focus:bg-error-foreground",
          }}
          required
        />
      </div>
      <div className="[&>button]:w-full md:hidden">
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

function Day() {
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const [date, setDate] = useState<Date>(today);

  return (
    <div className="flex flex w-full mt-4 flex-col md:flex-row">
      <div className="flex flex-col space-y-4 m-4">
        <AddEvent date={date} />
        <Suspense fallback={<Skeleton className="h-[360px] w-[360px]" />}>
          <Calendar date={date} setDate={setDate} />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="h-full w-full space-y-2 mt-12 overflow-hidden md:max-h-[calc(100vh-48px-16px)] max-h-[calc(100vh-132px-48px-16px)]">
            {[...new Array(100)].map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full block" />
            ))}
          </div>
        }
      >
        <div className="flex flex-col grow m-4">
          <div className="flex justify-between mx-4 items-center">
            <Streak />
            <div className="flex">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-10"
                      onClick={() => toast("bullet journal coming soon!")}
                    >
                      <NotepadTextIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bullet journal view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-10"
                      onClick={() => setDate(today)}
                    >
                      <CalendarIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View today</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-10"
                      onClick={() => toast("analysis coming soon!")}
                    >
                      <ChartSplineIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/roadmap"
                      className="w-10 inline-flex items-center justify-center"
                    >
                      <MapIcon />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Roadmap</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
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

  useCursorFriends();

  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full min-h-screen">
        {authenticated === false && <Login />}
        {authenticated === true && <Day />}
        {authenticated == null && (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2Icon className="h-12 w-12 animate-spin" />
          </div>
        )}
      </div>
      <div
        id="cursor-friends"
        className="overflow-hidden h-screen w-screen absolute pointer-events-none"
      />
      <Toaster />
    </main>
  );
}
