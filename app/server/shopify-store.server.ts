import { isUserAccessToken } from "./shopify-token.server";

type Location = {
  id: number | string;
  active?: boolean;
};

type LocationsResponse = {
  locations?: Location[];
};

export async function getPrimaryLocationId(
  shopDomain: string,
  accessToken: string
): Promise<string | null> {
  if (!shopDomain || !accessToken) return null;

  const endpoint = `https://${shopDomain}/admin/api/2024-10/locations.json`;
  const headers = isUserAccessToken(accessToken)
    ? { Authorization: `Bearer ${accessToken}` }
    : { "X-Shopify-Access-Token": accessToken };

  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch Shopify locations (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as LocationsResponse;
  const locations = payload.locations ?? [];
  const primary = locations.find((location) => location.active !== false) ?? locations[0];

  return primary ? String(primary.id) : null;
}
