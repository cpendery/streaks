import { useEffect } from "react";

export const useCursorFriends = () => {
  useEffect(() => {
    var friendsPerSecond = 50;
    var wait = false;
    window.addEventListener("mousemove", (e) => {
      if (wait) return;
      const elem = document.createElement("img");
      elem.className = "cursor-friend";
      elem.style.top = `${e.clientY}px`;
      elem.style.left = `${e.clientX}px`;
      elem.src = "/friend.png";
      elem.height = 512;
      elem.width = 512;
      const cursorFriends = document.getElementById("cursor-friends");
      cursorFriends?.appendChild(elem);
      wait = true;
      setTimeout(() => cursorFriends?.removeChild(elem), 2_500);
      setTimeout(() => (wait = false), 1_000 / friendsPerSecond);
    });
  }, []);
};
