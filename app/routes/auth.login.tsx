import type { ActionFunctionArgs, LoaderFunctionArgs } from "@react-router/node";
import * as React from "react";
import { Form, useActionData } from "react-router";
import { Page, Card, FormLayout, Text, TextField, Button } from "@shopify/polaris";
import shopify from "../shopify.server";

type LoginErrors = {
  shop?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const errors = await shopify.login(request);
  return errors;
}

export async function action({ request }: ActionFunctionArgs) {
  const errors = await shopify.login(request);
  return errors;
}

export default function Login() {
  const actionData = useActionData() as LoginErrors | undefined;
  const shopError = actionData?.shop;
  const [shop, setShop] = React.useState("");

  return (
    <Page title="Logg inn">
      <Card>
        <Form method="post">
          <FormLayout>
            <Text variant="headingMd" as="h2">
              Logg inn med butikk
            </Text>
            <TextField
              label="Shop domain"
              name="shop"
              value={shop}
              onChange={setShop}
              autoComplete="on"
              helpText="f.eks. din-butikk.myshopify.com"
              error={shopError}
            />
            <Button submit variant="primary">
              Fortsett
            </Button>
          </FormLayout>
        </Form>
      </Card>
    </Page>
  );
}
