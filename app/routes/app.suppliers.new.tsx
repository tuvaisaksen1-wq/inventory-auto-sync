import { Page, Card, Text, BlockStack } from "@shopify/polaris";

export default function SuppliersNew() {
  return (
    <Page title="New supplier">
      <BlockStack gap="400">
        <Card>
          <Text as="p">
            Denne siden laster uten Remix loader/action. Når routing er stabil,
            kan vi legge inn skjema og lagring.
          </Text>
        </Card>
      </BlockStack>
    </Page>
  );
}

