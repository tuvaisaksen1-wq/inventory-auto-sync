
import { BlockStack, InlineStack, Text, Button, Card } from "@shopify/polaris";
import { Base44PageHeader } from "../ui/Base44";

export default function Suppliers() {
  return (
    <BlockStack gap="400">
      <Base44PageHeader
        title="Suppliers"
        subtitle="Administrer leverandører og tilkoblinger"
      />

      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Connected suppliers
          </Text>

          <Card>
            <Text as="p" tone="subdued">
              No suppliers connected yet.
            </Text>
          </Card>
        </BlockStack>
      </Card>

      <Card>
        <InlineStack align="center">
          <Button variant="primary" url="/app/suppliers/new" fullWidth>
            Add supplier
          </Button>
        </InlineStack>
      </Card>
    </BlockStack>
  );
}
