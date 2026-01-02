import { Card, Text, BlockStack } from "@shopify/polaris";

export default function Index() {
  return (
    <BlockStack gap="400">
      <Text variant="heading2xl" as="h1">
        Inventory Auto Sync
      </Text>

      <Card>
        <BlockStack gap="200">
          <Text as="p">Routing fungerer.</Text>
          <Text as="p">Neste steg: lage /app-ruter (Dashboard/Suppliers/Products/Settings).</Text>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}