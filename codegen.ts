import type { CodegenConfig } from "@graphql-codegen/cli";

const schemaUrl = process.env.HASURA_GRAPHQL_URL;
const adminSecret = process.env.HASURA_ADMIN_SECRET;

if (!schemaUrl || !adminSecret) {
  throw new Error(
    "[codegen] HASURA_GRAPHQL_URL and HASURA_ADMIN_SECRET must be set. " +
      "These are server-only variables — never prefix them with NEXT_PUBLIC_.",
  );
}

const config: CodegenConfig = {
  schema: {
    [schemaUrl]: {
      headers: {
        "x-hasura-admin-secret": adminSecret,
      },
    },
  },
  documents: ["src/graphql/**/*.{ts,tsx}"],
  ignoreNoDocuments: true,
  generates: {
    "./src/graphql/generated/": {
      preset: "client",
      config: {
        useTypeImports: true,
        defaultScalarType: "unknown",
        strictScalars: true,
        scalars: {
          UUID: "string",
          timestamptz: "string",
          jsonb: "Record<string, unknown>",
          numeric: "number",
        },
      },
    },
    "./src/graphql/generated/schema.graphql": {
      plugins: ["schema-ast"],
    },
  },
  hooks: {
    afterAllFileWrite: ["prettier --write"],
  },
};

export default config;
