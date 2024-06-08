import { atom } from "recoil";
import type { MonthOverview } from "@/app/api/events/month/[date]/route";

export const authState = atom<boolean | undefined>({
  key: "authState",
  default: undefined,
});

type MonthState = {
  month: Date;
  overview: MonthOverview;
};

export const monthState = atom<MonthState>({
  key: "monthState",
  default: {
    month: new Date(),
    overview: {},
  },
});

// export const dayState = atom<
