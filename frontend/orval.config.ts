import { defineConfig } from "orval";

export default defineConfig({
  eos: {
    input: {
      target: "http://localhost:8000/openapi.json",
    },
    output: {
      target: "./src/api/generated/index.ts",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/api/client.ts",
          name: "customFetch",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
      prettier: false,
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});
