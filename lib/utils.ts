import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toDateString(date: Date | undefined, format: "month" | "day") {
  if (date == null) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  switch (format) {
    case "month":
      return `${yyyy}-${mm}`;
    case "day":
      return `${yyyy}-${mm}-${dd}`;
  }
}
