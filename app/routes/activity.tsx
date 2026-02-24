import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "@react-router/node";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return redirect(`/app/activity${url.search}`);
}

export default function ActivityLegacyRedirect() {
  return null;
}
