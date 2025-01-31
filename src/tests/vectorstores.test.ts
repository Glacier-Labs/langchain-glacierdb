/* eslint-disable no-process-env */
/* eslint-disable no-promise-executor-return */

import { test, expect } from "@jest/globals";
import { GlacierClient } from "@glacier-network/client";
import { setTimeout } from "timers/promises";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

import { GlacierVectorStore } from "../vectorstores.js";

/**
 * The following json can be used to create an index in atlas for Cohere embeddings.
 * Use "langchain.test" for the namespace and "default" for the index name.

{
  "mappings": {
    "fields": {
      "e": { "type": "number" },
      "embedding": {
        "dimensions": 1536,
        "similarity": "euclidean",
        "type": "knnVector"
      }
    }
  }
}
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
async function initOnce(client: any, namespace: string, dataset: string, collection: string) {
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
    required: ['id', 'vector', 'document', 'metadata', 'createdAt', 'updatedAt'],
  };
  await client.createNamespace(namespace)
  await client.namespace(namespace).createDataset(dataset)
  await client.namespace(namespace).dataset(dataset).createCollection(collection, schema);
}

test("Basic Usage", async () => {
  expect(process.env.GLACIERDB_PRIVATE_KEY).toBeDefined();
  expect(process.env.GLACIERDB_ENDPOINT).toBeDefined();
  expect(process.env.GLACIERDB_NAMESPACE).toBeDefined();
  expect(process.env.GLACIERDB_DATASET).toBeDefined();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const client = new GlacierClient(process.env.GLACIERDB_ENDPOINT!, { privateKey: process.env.GLACIERDB_PRIVATE_KEY! });

  try {
    const collectionName = "vectorstoretest";
    await initOnce(client, process.env.GLACIERDB_NAMESPACE!, process.env.GLACIERDB_DATASET!, collectionName);
    const collection = client.namespace(process.env.GLACIERDB_NAMESPACE!).database(process.env.GLACIERDB_DATASET!).collection();

    const vectorStore = new GlacierVectorStore(new OpenAIEmbeddings(), {
      collection,
    });

    expect(vectorStore).toBeDefined();

    await vectorStore.addDocuments([
      {
        pageContent: "Dogs are tough.",
        metadata: { a: 1, created_at: new Date().toISOString() },
      },
      {
        pageContent: "Cats have fluff.",
        metadata: { b: 1, created_at: new Date().toISOString() },
      },
      {
        pageContent: "What is a sandwich?",
        metadata: { c: 1, created_at: new Date().toISOString() },
      },
      {
        pageContent: "That fence is purple.",
        metadata: { d: 1, e: 2, created_at: new Date().toISOString() },
      },
    ]);

    // we sleep 5 seconds to make sure the index in atlas has replicated the new documents
    await setTimeout(5000);
    const results: Document[] = await vectorStore.similaritySearch(
      "Sandwich",
      1
    );

    expect(results.length).toEqual(1);
    expect(results).toMatchObject([
      { pageContent: "What is a sandwich?", metadata: { c: 1 } },
    ]);

    // // we can pre filter the search
    // const preFilter = {
    //   e: { $lte: 1 },
    // };

    // const filteredResults = await vectorStore.similaritySearch(
    //   "That fence is purple",
    //   1,
    //   preFilter
    // );

    // expect(filteredResults).toEqual([]);

    // const retriever = vectorStore.asRetriever({
    //   filter: {
    //     preFilter,
    //   },
    // });

    // const docs = await retriever.getRelevantDocuments("That fence is purple");
    // expect(docs).toEqual([]);
  } finally {
    await client.close();
  }
});