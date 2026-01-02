// app/Layout.tsx
import type { ReactNode } from "react";
import { Frame, Navigation, Page } from "@shopify/polaris";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <Frame
      navigation={
        <Navigation location="/app">
          <Navigation.Section
            title="Inventory Auto Sync v2"
            items={[
              { label: "Dashboard", url: "/app" },
              { label: "Suppliers", url: "/app/suppliers" },
              { label: "Products", url: "/app/products" },
              { label: "Settings", url: "/app/settings" },
            ]}
          />
        </Navigation>
      }
    >
      <Page>{children}</Page>
    </Frame>
  );
}





