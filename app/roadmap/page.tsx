"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCursorFriends } from "@/hooks/useCursorFriends";
import { useRouter } from "next/navigation";
import { useId } from "react";

function Item({ text, checked }: { text: string; checked: boolean }) {
  const id = useId();
  return (
    <div className="flex items-center space-x-2 my-1">
      <Checkbox id={id} checked={checked} />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {text}
      </label>
    </div>
  );
}

export default function Roadmap() {
  useCursorFriends();
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="mb-3 text-3xl underline underline-offset-2">Roadmap</h1>
      <div className="flex flex-col justify-center">
        <Item checked={true} text="add series delete support" />
        <Item checked={false} text="add streak rewards / road" />
        <Item checked={false} text="add total completed tasks reward path" />
        <Item checked={false} text="add total completed days reward path" />
        <Item checked={false} text="add streak length reward path" />
      </div>
      <div
        id="cursor-friends"
        className="overflow-hidden h-screen w-screen absolute pointer-events-none"
      />
    </main>
  );
}
