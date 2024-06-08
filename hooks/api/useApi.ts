import { useQuery } from "@tanstack/react-query";

export const useApi = <T>(options: {
  key: any[];
  route: string;
  body?: object | any[];
  method?: "GET" | "POST";
}) => {
  const { body, method, key, route } = options;
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const jwt = localStorage.getItem("jwt") ?? "";
      const response = await fetch(route, {
        method,
        headers: { Authorization: `Bearer ${jwt}` },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${await response.text()}`);
      }
      return response.json();
    },
  });
};
