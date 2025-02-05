/* eslint-disable no-process-env */
/* eslint-disable no-promise-executor-return */

import { test, expect } from "@jest/globals";
import { GlacierClient } from "@glacier-network/client";
import { setTimeout } from "timers/promises";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

import { GlacierVectorStore } from "../vectorstores.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function initOnce(
  client: any,
  namespace: string,
  dataset: string,
  collection: string
) {
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
  try {
    await client.createNamespace(namespace);
    await client.namespace(namespace).createDataset(dataset);
    await client
      .namespace(namespace)
      .dataset(dataset)
      .createCollection(collection, schema);
  } catch (error) {
    // ingore for test
  }
}

test("Basic Usage", async () => {
  expect(process.env.GLACIERDB_PRIVATE_KEY).toBeDefined();
  expect(process.env.GLACIERDB_ENDPOINT).toBeDefined();
  expect(process.env.GLACIERDB_NAMESPACE).toBeDefined();
  expect(process.env.GLACIERDB_DATASET).toBeDefined();
  expect(process.env.GLACIERDB_MODELNAME).toBeDefined();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const client = new GlacierClient(process.env.GLACIERDB_ENDPOINT!, {
    privateKey: process.env.GLACIERDB_PRIVATE_KEY!,
  });

  const collectionName = "vectorstoretest";
  await initOnce(
    client,
    process.env.GLACIERDB_NAMESPACE!,
    process.env.GLACIERDB_DATASET!,
    collectionName
  );
  const collection = client
    .namespace(process.env.GLACIERDB_NAMESPACE!)
    .dataset(process.env.GLACIERDB_DATASET!)
    .collection(collectionName);

  // model output 384-dimensional
  const vectorStore = new GlacierVectorStore(
    new OpenAIEmbeddings({ modelName: process.env.GLACIERDB_MODELNAME }),
    {
      collection,
    }
  );

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

  await setTimeout(5000);
  const results: Document[] = await vectorStore.similaritySearch("Sandwich", 1);

  expect(results.length).toEqual(1);
  expect(results).toMatchObject([
    { pageContent: "What is a sandwich?", metadata: { c: 1 } },
  ]);

  const results1: [Document, number][] =
    await vectorStore.similaritySearchWithScore("Sandwich", 1);
  console.log(JSON.stringify(results1));

  expect(results1.length).toEqual(1);
});
