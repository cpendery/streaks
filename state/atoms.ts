import { atom } from "recoil";
import type { MonthOverview } from "@/app/api/events/month/[date]/route";

export const authState = atom<boolean | undefined>({
  key: "authState",
  default: undefined,
});

export const monthState = atom<MonthOverview>({
  key: "monthState",
  default: {},
});
