"use client";

import { cn, toDateString } from "@/lib/utils";
import { useMediaQuery } from "@raddix/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { ReactNode, useState } from "react";
import { EventsPutRequest } from "@/app/api/events/route";
import { toast } from "sonner";
import { useInvalidateEvents } from "@/hooks/api/useInvalidateEvents";
import { useInvalidateMonthOverview } from "@/hooks/api/useInvalidateMonthOverview";
import { apiAction } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const AddEvent = ({ date }: { date: Date }) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="max-w-32">
            <Plus className="mr-2 h-4 w-4" /> Add task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add new task</DialogTitle>
            <DialogDescription>
              Get started with a new habit or add new checkpoints to current
              ones!
            </DialogDescription>
          </DialogHeader>
          <Form onSuccess={() => setOpen(false)} date={date} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add task
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add new task</DrawerTitle>
          <DrawerDescription>
            Get started with a new habit or add new checkpoints to current ones!
          </DrawerDescription>
        </DrawerHeader>
        <Form className="px-4" onSuccess={() => setOpen(false)} date={date} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const DayButton = ({
  day,
  repeatDays,
  setRepeatDays,

  children,
}: {
  day: number;
  repeatDays: number[];
  setRepeatDays: (days: number[]) => void;
  children: ReactNode;
}) => {
  const clicked = repeatDays.includes(day);
  const className = cn(
    "rounded-full w-8 h-8",
    clicked
      ? "text-background bg-foreground"
      : "text-foreground bg-accent border"
  );
  return (
    <button
      className={className}
      type="button"
      onClick={() => {
        if (clicked) {
          setRepeatDays(repeatDays.filter((d) => d != day));
        } else {
          setRepeatDays([...repeatDays, day]);
        }
      }}
    >
      {children}
    </button>
  );
};

function Form({
  className,
  onSuccess,
  date,
}: React.ComponentProps<"form"> & { onSuccess: () => void; date: Date }) {
  const [startDate, setStartDate] = useState<Date>(date);
  const [endDate, setEndDate] = useState<Date>(date);
  const [name, setName] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [repeatDays, setRepeatDays] = useState([date.getDay()]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");

  const invalidateEvents = useInvalidateEvents();
  const invalidateMonthOverview = useInvalidateMonthOverview();

  return (
    <form
      className={cn("grid items-start gap-4", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        const body: EventsPutRequest = {
          name,
          repeatDays,
          endDate: toDateString(endDate, "day"),
          startDate: toDateString(startDate, "day"),
          repeat,
          tags,
        };
        const ok = await apiAction({
          route: "/api/events",
          method: "PUT",
          body,
        });
        const taskMessage = repeat ? "tasks" : "task";
        if (ok) {
          toast.success(`Successfully created ${taskMessage}: ${name}`);
          onSuccess();
          invalidateEvents();
          invalidateMonthOverview();
        } else {
          toast.error(`Failed to create ${taskMessage}: ${name}`);
        }
        setLoading(false);
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Event 1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={repeat}
          onCheckedChange={(checked) => setRepeat(checked)}
          id="repeat"
        />
        <Label htmlFor="repeat">Repeat</Label>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="start-date">{repeat ? "Start date" : "Date"}</Label>
        <DatePicker
          id="start-date"
          date={startDate}
          setDate={setStartDate}
          label={repeat ? "Start date" : "Date"}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tag">Tags</Label>
        {tags.length != 0 && (
          <div className="flex my-1">
            {tags.map((tag, idx) => (
              <Badge
                variant="secondary"
                className="mr-1"
                key={idx}
                onClick={() =>
                  setTags([...tags.slice(0, idx), ...tags.slice(idx + 1)])
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <Input
          id="tag"
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key == "Enter" || e.key == "Tab") {
              e.preventDefault();
              setTag("");
              if (!tags.includes(tag)) {
                setTags([...tags, tag]);
                const ok = await apiAction({
                  route: `/api/events/tag`,
                  method: "PUT",
                  body: { name: tag },
                });
                if (!ok) {
                  toast.error(`Failed to create tag: ${tag}`);
                  setTags((tags) => tags.filter((t) => t != tag));
                }
              }
            }
          }}
        />
      </div>

      {repeat && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="end-date">End date</Label>
            <DatePicker
              id="end-date"
              date={endDate}
              setDate={setEndDate}
              label="End date"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="repeat-days">Repeats on</Label>
            <div id="repeat-days" className="flex space-x-2">
              <DayButton
                day={0}
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              >
                S
              </DayButton>
              <DayButton
                day={1}
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              >
                M
              </DayButton>
              <DayButton
                day={2}
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              >
                T
              </DayButton>
              <DayButton
                day={3}
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              >
                W
              </DayButton>
              <DayButton
                day={4}
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              >
                T
              </DayButton>
              <DayButton
                day={5}
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              >
                F
              </DayButton>
              <DayButton
                day={6}
                repeatDays={repeatDays}
                setRepeatDays={setRepeatDays}
              >
                S
              </DayButton>
            </div>
          </div>
        </>
      )}
      {loading ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating task
        </Button>
      ) : (
        <Button type="submit">Create task</Button>
      )}
    </form>
  );
}

export { AddEvent };
