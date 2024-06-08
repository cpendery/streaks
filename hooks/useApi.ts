import useSWR, { SWRResponse } from "swr";
import useSWRImmutable from "swr/immutable";

export const useApi = <T>(
  route: string,
  options?: {
    suspense?: boolean;
    body?: object | any[];
    method?: "GET" | "POST";
  }
) => {
  const { suspense, body, method } = options ?? {};
  return useSWRImmutable<T, Error>(
    route,
    async (url: string) => {
      const jwt = localStorage.getItem("jwt") ?? "";
      // await new Promise(resolve => setTimeout(() => resolve(1), 5000000));
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${jwt}` },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${await response.text()}`);
      }
      return response.json();
    },
    {
      suspense,
    }
  );
};
