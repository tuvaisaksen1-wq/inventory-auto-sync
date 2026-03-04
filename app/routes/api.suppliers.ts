import type { LoaderFunctionArgs } from "react-router";
import { prisma } from "../server/prisma.server";

export async function action() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.INTERNAL_API_SECRET) {
    return Response.json({ error: "Unauthorized" }, { 
      status: 401, 
      headers: { "Access-Control-Allow-Origin": "*" } 
    });
  }

  const suppliers = await prisma.supplierProfile.findMany();

  return Response.json({ suppliers }, {
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}
