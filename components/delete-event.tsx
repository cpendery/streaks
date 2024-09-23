"use client";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@raddix/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInvalidateEvents } from "@/hooks/api/useInvalidateEvents";
import { useInvalidateMonthOverview } from "@/hooks/api/useInvalidateMonthOverview";
import { apiAction } from "@/lib/api";
import { Task } from "@/app/api/events/day/[date]/route";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  EventDeleteMode,
  EventsDeleteRequest,
} from "@/app/api/events/[id]/route";

const DeleteEvent = ({
  todo,
  open,
  setOpen,
}: {
  todo: Task;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete recurring task</DialogTitle>
          </DialogHeader>
          <Form todo={todo} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Delete recurring task</DrawerTitle>
        </DrawerHeader>
        <Form className="px-4" todo={todo} />
      </DrawerContent>
    </Drawer>
  );
};

const getSuccessMessage = (todo: Task, mode: EventDeleteMode) => {
  switch (mode) {
    case "all":
      return `Successfully deleted task series: ${todo.name}`;
    case "this-and-following":
      return `Successfully deleted this and following tasks: ${todo.name}`;
    case "this":
      return `Successfully deleted task: ${todo.name}`;
  }
};

const getErrorMessage = (todo: Task, mode: EventDeleteMode) => {
  switch (mode) {
    case "all":
      return `Failed to delete task series: ${todo.name}`;
    case "this-and-following":
      return `Failed to delete this and following tasks: ${todo.name}`;
    case "this":
      return `Failed to delete task: ${todo.name}`;
  }
};

function Form({
  className,
  todo,
}: React.ComponentProps<"form"> & { todo: Task }) {
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState<EventDeleteMode>("this");
  const invalidateEvents = useInvalidateEvents();
  const invalidateMonthOverview = useInvalidateMonthOverview();

  return (
    <form
      className={cn("grid items-start gap-4", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log(todo);
        const body: EventsDeleteRequest = {
          sid: todo.sid,
          mode: deleteMode,
        };
        const ok = await apiAction({
          route: `/api/events/${todo.uid}`,
          method: "DELETE",
          body,
        });
        if (ok) {
          toast.success(getSuccessMessage(todo, deleteMode));
          invalidateEvents();
          invalidateMonthOverview();
        } else {
          toast.error(getErrorMessage(todo, deleteMode));
        }
        setLoading(false);
      }}
    >
      <div className="grid gap-2">
        <RadioGroup
          onValueChange={(value) => setDeleteMode(value as EventDeleteMode)}
        >
          <div className="flex items-center  space-x-2">
            <RadioGroupItem
              value="this"
              id="r1"
              checked={deleteMode == "this"}
            />
            <Label htmlFor="r1">This event</Label>
          </div>
          <div className="flex items-center  space-x-2">
            <RadioGroupItem
              value="this-and-following"
              id="r2"
              checked={deleteMode == "this-and-following"}
            />
            <Label htmlFor="r2">This and all following events</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="r3" checked={deleteMode == "all"} />
            <Label htmlFor="r3">All events</Label>
          </div>
        </RadioGroup>
      </div>
      {loading ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting
        </Button>
      ) : (
        <Button type="submit">Ok</Button>
      )}
    </form>
  );
}

export { DeleteEvent };
