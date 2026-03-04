import { json } from "@react-router/node";
import { pool } from "~/db.server";

export async function loader() {
  try {
    const result = await pool.query(
      "SELECT shop_domain FROM stores WHERE status='connected' LIMIT 1"
    );

    if (!result.rows.length) {
      return json({ shop: null });
    }

    return json({
      shop: result.rows[0].shop_domain,
      status: "connected"
    });

  } catch (error) {
    console.error(error);
    return json({ error: "Failed to fetch store" }, { status: 500 });
  }
}
