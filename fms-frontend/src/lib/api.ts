const API_URL = `http://localhost:3001/api`;

const fetchWrapper = async (
  url: string,
  method: string,
  body?: any,
  headers?: any,
) => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
};

export const sendToApiGetCurrentGameSimulation = async () =>
  await fetchWrapper(`${API_URL}/simulations`, "GET");

export const sendToApiCreateNewGameSimulation = async (name: string) =>
  await fetchWrapper(`${API_URL}/simulations`, "POST", {
    name,
  });
