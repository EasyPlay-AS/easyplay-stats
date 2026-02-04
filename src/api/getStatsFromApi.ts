import { ICollectionStat } from "@/shared/interfaces/ICollectionStat";

export async function getStatsFromApi(): Promise<ICollectionStat[]> {
  const baseUrl = process.env.EASYPLAY_API_BASE_URL;
  const clientId = process.env.EASYPLAY_API_CLIENT_ID;
  const clientSecret = process.env.EASYPLAY_API_CLIENT_SECRET;

  try {
    if (!baseUrl) {
      throw new Error("Missing API base URL");
    }

    if (!clientId || !clientSecret) {
      throw new Error("Missing client ID or client secret");
    }

    const token = await fetch(`${baseUrl}/api_clients/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (!token.ok) {
      throw new Error("Failed to get token");
    }

    const tokenData = await token.json();
    const authToken = tokenData.token;

    const response = await fetch(baseUrl + "/stats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
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
