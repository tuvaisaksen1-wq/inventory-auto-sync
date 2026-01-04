import { Card, InlineStack, Text, Badge, BlockStack } from "@shopify/polaris";
import type { ReactNode } from "react";

export function Base44PageHeader({
  title,
  subtitle,
  statusText,
}: {
  title: string;
  subtitle?: string;
  statusText?: string;
}) {
  return (
    <Card>
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="100">
          <Text as="h1" variant="headingLg">
            {title}
          </Text>
          {subtitle ? (
            <Text as="p" variant="bodyMd" tone="subdued">
              {subtitle}
            </Text>
          ) : null}
        </BlockStack>

        {statusText ? <Badge tone="success">{statusText}</Badge> : null}
      </InlineStack>
    </Card>
  );
}

export function Base44Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingMd">
          {title}
        </Text>
        {children}
      </BlockStack>
    </Card>
  );
}
