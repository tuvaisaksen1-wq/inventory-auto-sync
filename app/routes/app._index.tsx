import { Page, Card, Text, BlockStack } from "@shopify/polaris";

export default function Dashboard() {
  return (
    <Page title="Dashboard">
      <BlockStack gap="400">
        <Card>
          <Text as="p" variant="bodyMd">
            Polaris fungerer. Routing fungerer. Klar for å bygge UI.
          </Text>
        </Card>
      </BlockStack>
    </Page>
  );
}




