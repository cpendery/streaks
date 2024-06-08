export const apiAction = async (options: {
  route: string;
  method: "POST" | "PUT" | "DELETE";
  body?: object | any[];
}) => {
  const { route, method, body } = options;
  const jwt = localStorage.getItem("jwt") ?? "";
  const response = await fetch(route, {
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${jwt}` },
    method,
  });
  return response.ok;
};
