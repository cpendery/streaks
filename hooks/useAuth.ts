import { authState } from "@/state/atoms";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";

export const useAuth = () => {
  const setAuth = useSetRecoilState(authState);
  useEffect(() => {
    const jwt = localStorage.getItem("jwt") ?? "";
    fetch("/api/user/auth", {
      headers: { Authorization: `Bearer ${jwt}` },
    }).then((response) => setAuth(response.ok));
  }, [setAuth]);
};
