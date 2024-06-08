"use client";

import { ReactNode } from "react";
import { RecoilRoot } from "recoil";

const Roots = ({ children }: { children: ReactNode }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

export { Roots };
