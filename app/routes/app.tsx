import { Outlet } from "react-router";
import Layout from "../Layout";

export default function AppRoute() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
