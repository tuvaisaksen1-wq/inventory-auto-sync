const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function triggerInventorySync(payload: unknown) {
  const url = process.env.N8N_INVENTORY_SYNC_URL;
  if (!url) {
    throw new Error("Missing N8N_INVENTORY_SYNC_URL");
  }

  const maxAttempts = 3;
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data: unknown = text;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (response.ok) {
        return { ok: true, status: response.status, data, attempts: attempt };
      }

      if (response.status < 500 && response.status !== 429) {
        return { ok: false, status: response.status, data, attempts: attempt };
      }

      lastError = new Error(`n8n responded ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < maxAttempts) {
      await sleep(400 * Math.pow(2, attempt - 1));
    }
  }

  throw lastError ?? new Error("Failed to reach n8n");
}
