import { ICollectionStat } from "@/shared/interfaces/ICollectionStat";

async function getToken(
  baseUrl: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch(`${baseUrl}/api_clients/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clientId, clientSecret }),
  });

  if (!response.ok) {
    throw new Error("Failed to get token");
  }

  const tokenData = await response.json();
  return tokenData.token;
}

export async function getStatsFromApi(): Promise<ICollectionStat[]> {
  const baseUrl = process.env.EASYPLAY_API_BASE_URL;
  const clientId = process.env.EASYPLAY_API_CLIENT_ID;
  const clientSecret = process.env.EASYPLAY_API_CLIENT_SECRET;
  const adminSecret = process.env.EASYPLAY_API_ADMIN_SECRET;

  if (!baseUrl) {
    throw new Error("Missing API base URL");
  }

  if (!clientId) {
    throw new Error("Missing client ID");
  }

  if (!clientSecret) {
    throw new Error("Missing client secret");
  }

  if (!adminSecret) {
    throw new Error("Missing admin secret");
  }

  try {
    const token = await getToken(baseUrl, clientId, clientSecret);
    const response = await fetch(baseUrl + "/stats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error("Unauthorized: Invalid or expired token");
        case 500:
          throw new Error("Internal server error");
        default:
          throw new Error(`Error. Status: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Stats fetch error:", error);
    return [];
  }
}
