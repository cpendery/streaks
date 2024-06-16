type ApiOptions = {
  route: string;
  method: "POST" | "PUT" | "DELETE";
  body?: object | any[];
};

export const apiAction = async (options: ApiOptions) => {
  return (await apiMutation(options)).ok;
};

export const apiMutation = async (options: ApiOptions) => {
  const { route, method, body } = options;
  const jwt = localStorage.getItem("jwt") ?? "";
  const response = await fetch(route, {
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${jwt}` },
    method,
  });
  return response;
};
