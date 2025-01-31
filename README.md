# @glacier-network/langchain-glacierdb

This package contains the LangChainJS integrations for langchain-glacierdb through their SDK.

## Installation

```bash npm2yarn
npm install @glacier-network/langchain-glacierdb
```

## Chat Models

This package contains the `langchain-glacierdb` class, which is the recommended way to interface with the langchain-glacierdb series of models.

To use, install the requirements, and configure your environment.

```bash
export <ADD_ENV_NAME_HERE>=your-api-key
```

Then initialize

```typescript
import { langchain-glacierdb } from "@glacier-network/langchain-glacierdb";

const model = new ExampleChatClass({
  apiKey: process.env.EXAMPLE_API_KEY,
});
const response = await model.invoke(new HumanMessage("Hello world!"));
```

### Streaming

```typescript
import { langchain-glacierdb } from "@glacier-network/langchain-glacierdb";

const model = new ExampleChatClass({
  apiKey: process.env.EXAMPLE_API_KEY,
});
const response = await model.stream(new HumanMessage("Hello world!"));
```

## Embeddings

This package also adds support for langchain-glacierdb embeddings model.

```typescript
import { langchain-glacierdb } from "@glacier-network/langchain-glacierdb";

const embeddings = new ExampleEmbeddingClass({
  apiKey: process.env.EXAMPLE_API_KEY,
});
const res = await embeddings.embedQuery("Hello world");
```

## Development

To develop the langchain-glacierdb package, you'll need to follow these instructions:

### Install dependencies

```bash
yarn install
```

### Build the package

```bash
yarn build
```

Or from the repo root:

```bash
yarn build --filter=@glacier-network/langchain-glacierdb
```

### Run tests

Test files should live within a `tests/` file in the `src/` folder. Unit tests should end in `.test.ts` and integration tests should
end in `.int.test.ts`:

```bash
$ yarn test
$ yarn test:int
```

### Lint & Format

Run the linter & formatter to ensure your code is up to standard:

```bash
yarn lint && yarn format
```

### Adding new entrypoints

If you add a new file to be exported, either import & re-export from `src/index.ts`, or add it to `scripts/create-entrypoints.js` and run `yarn build` to generate the new entrypoint.
