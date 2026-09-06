export async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`The server returned an unexpected response (${response.status}).`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("The server returned invalid JSON.");
  }
}
