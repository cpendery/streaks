"use client";

import { useCallback, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DatePicker = ({
  date,
  setDate,
  label,
  id,
  ...props
}: {
  date: Date;
  setDate: (date: Date) => void;
  label: string;
  id?: string;
} & CalendarProps) => {
  const [open, setOpen] = useState(false);
  const onSelect = useCallback(
    (date: Date) => {
      setDate(date);
      setOpen(false);
    },
    [setDate]
  );

  return (
    <Popover open={open} onOpenChange={(open) => setOpen(open)}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          id={id}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          {...props}
          mode="single"
          selected={date}
          onSelect={onSelect as any}
          required
        />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };
