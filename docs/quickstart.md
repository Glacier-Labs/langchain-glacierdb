# GlacierDB Vector Store For LangChainJS

This guide provides a quick overview for getting started with GlacierDB [vector stores](/docs/concepts/#vectorstores) within LangChainJS.

## Overview

### Integration details

| Class Package  | Latest |
| -- | -- |
| `@glacier-network/langchain-glacierdb` | [![npm](https://img.shields.io/npm/v/@glacier-network/langchain-glacierdb)](https://www.npmjs.com/package/@glacier-network/langchain-glacierdb) |


## Setup

To use GlacierDB vector stores, you\'ll need to configure a GlacierDB collection schema and install the `@glacier-network/langchain-glacierdb` integration package.

### Creating a collection schema

More details on creating a collection schema can be found in the [Glacier VectorDB](https://sdk.glacier.io/tutorial/demo_vector#create-vectordb-collection).

The blow schema is ok for most use cases. Just replace the dimension with your own.

``` json
const schema = {
    title: collection,
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      vector: {
        type: "array",
        items: {
          type: "number",
        },
        vectorIndexOption: {
          type: "knnVector",
          dimensions: 384,
          similarity: "euclidean",
        },
      },
      document: {
        type: "string",
      },
      metadata: {
        type: "object",
      },
      createdAt: {
        type: "number",
      },
      updatedAt: {
        type: "number",
      },
    },
    required: [
      "id",
      "vector",
      "document",
      "metadata",
      "createdAt",
      "updatedAt",
    ],
  };
```

Note that the dimensions property should match the dimensionality of the
embeddings you are using. For example, Cohere embeddings have 1024
dimensions, and by default OpenAI embeddings have 1536:


### Embeddings

This guide will also use [OpenAI
embeddings](/docs/integrations/text_embedding/openai), which require you
to install the `@langchain/openai` integration package. You can also use
[other supported embeddings models](/docs/integrations/text_embedding)
if you wish.

### Installation

Install the following packages:

```
yarn add @glacier-network/langchain-glacierdb @langchain/openai @langchain/core
```

### Credentials

Once you\'ve done the above, set the environment variable 

``` typescript
process.env.GLACIERDB_ENDPOINT=https://greenfield.onebitdev.com/glacier-gateway/
process.env.GLACIERDB_NAMESPACE='your namespace'
process.env.GLACIERDB_DATASET='your dataset'
process.env.GLACIERDB_COLLECTION='your collection'
process.env.GLACIERDB_PRIVATE_KEY='your private key'
process.env.GLACIERDB_MODELNAME='your model name'
```

If you are using OpenAI embeddings for this guide, you\'ll need to set
your OpenAI key as well:

``` typescript
process.env.OPENAI_API_KEY = "YOUR_API_KEY";
```

## Instantiation

Once you\'ve set up your cluster as shown above, you can initialize your
vector store as follows:

``` typescript
import { GlacierVectorStore } from "@glacier-network/langchain-glacierdb";
import { OpenAIEmbeddings } from "@langchain/openai";
const client = new GlacierClient(process.env.GLACIERDB_ENDPOINT!, {
    privateKey: process.env.GLACIERDB_PRIVATE_KEY!,
});

const collection = client
.namespace(process.env.GLACIERDB_NAMESPACE!)
.dataset(process.env.GLACIERDB_DATASET!)
.collection(process.env.GLACIERDB_COLLECTION!);

const vectorStore = new GlacierVectorStore(
    new OpenAIEmbeddings({ modelName: process.env.GLACIERDB_MODELNAME }),
    {
    collection,
    }
);
```

## Manage vector store

### Add items to vector store

You can now add documents to your vector store:

``` typescript
import type { Document } from "@langchain/core/documents";

const document1: Document = {
  pageContent: "The powerhouse of the cell is the mitochondria",
  metadata: { source: "https://example.com" }
};

const document2: Document = {
  pageContent: "Buildings are made out of brick",
  metadata: { source: "https://example.com" }
};

const document3: Document = {
  pageContent: "Mitochondria are made out of lipids",
  metadata: { source: "https://example.com" }
};

const document4: Document = {
  pageContent: "The 2024 Olympics are in Paris",
  metadata: { source: "https://example.com" }
}

const documents = [document1, document2, document3, document4];

await vectorStore.addDocuments(documents, { ids: ["1", "2", "3", "4"] });
```

**Note:** After adding documents, there is a slight delay before they
become queryable.

## Query vector store

Once your vector store has been created and the relevant documents have
been added you will most likely wish to query it during the running of
your chain or agent.

### Query directly

Performing a simple similarity search can be done as follows:

``` typescript
const similaritySearchResults = await vectorStore.similaritySearch("biology", 2);

for (const doc of similaritySearchResults) {
  console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
}
```

### Returning scores

If you want to execute a similarity search and receive the corresponding
scores you can run:

``` typescript
const similaritySearchWithScoreResults = await vectorStore.similaritySearchWithScore("biology", 2, filter)

for (const [doc, score] of similaritySearchWithScoreResults) {
  console.log(`* [SIM=${score.toFixed(3)}] ${doc.pageContent} [${JSON.stringify(doc.metadata)}]`);
}
```

### Usage for retrieval-augmented generation

For guides on how to use this vector store for retrieval-augmented
generation (RAG), see the following sections:

-   [Tutorials: working with external knowledge](/docs/tutorials/#working-with-external-knowledge).
-   [How-to: Question and answer with RAG](/docs/how_to/#qa-with-rag)
-   [Retrieval conceptual docs](/docs/concepts/retrieval)

## Reference

For detailed documentation of all `GlacierVectorStore` features
and configurations head to the [Glacier VectorDB Demo](https://github.com/Glacier-Labs/langchain-glacierdb/blob/main/src/tests/vectorstores.test.ts).
