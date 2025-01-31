import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { VectorStore } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Database config for your vectorstore.
 */
export interface VectorstoreIntegrationParams {
  collection: any; // GlacierDB's Collection Instance
}

interface SearchResult {
  document: string;
  metadata: Record<string, any>;
  score: number;
}

/**
 * Class for managing and operating vector search applications with
 * GlacierDB, a vector search database.
 */
export class GlacierVectorStore extends VectorStore {
  private collection: any;

  // Replace
  _vectorstoreType(): string {
    return "langchain-glacierdb";
  }

  constructor(embeddings: EmbeddingsInterface, params: VectorstoreIntegrationParams) {
    super(embeddings, params);
    this.embeddings = embeddings;
    this.collection = params.collection
  }

  /**
   * Method to add an array of documents to the vectorstore.
   *
   * Useful to override in case your vectorstore doesn't work directly with embeddings.
   */
  async addDocuments(
    documents: Document[],
    options?: { ids?: string[] } | string[]
  ): Promise<void> {
    const texts = documents.map(({ pageContent }) => pageContent);
    await this.addVectors(
      await this.embeddings.embedDocuments(texts),
      documents,
      options
    );
  }

  /**
   * Method to add raw vectors to the vectorstore.
   */
  async addVectors(
    vectors: number[][],
    documents: Document[],
    options?: { ids?: string[] } | string[]
  ) {
    const now = Date.now();
    const ids = (Array.isArray(options) ? options : options?.ids) || documents.map(() => this.generateId());
    const records = vectors.map((vector, index) => ({
      id: ids[index],
      vector,
      document: documents[index].pageContent,
      metadata: documents[index].metadata,
      createdAt: now,
      updatedAt: now,
    }));
  
    for (const record of records) {
      await this.collection.insertOne(record);
    }
  }


  /**
   * Method to perform a similarity search over the vectorstore and return
   * the k most similar vectors along with their similarity scores.
   */
  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: object
  ): Promise<[Document, number][]> {
    const docs = await this.collection.find({
      numCandidates: 10 * k,
      vectorPath: 'vector',
      queryVector: query,
      filter,
    }).limit(k).toArray();

    return docs.map((result: SearchResult) => [
      new Document({
        pageContent: result.document,
        metadata: result.metadata,
      }),
      result.score,
    ]);
  }

  /**
   * Static method to create a new instance of the vectorstore from an
   * array of Document instances.
   *
   * Other common static initializer names are fromExistingIndex, initialize, and fromTexts.
   */
  static async fromDocuments(
    docs: Document[],
    embeddings: EmbeddingsInterface,
    dbConfig: VectorstoreIntegrationParams
  ): Promise<GlacierVectorStore> {
    const instance = new this(embeddings, dbConfig);
    await instance.addDocuments(docs);
    return instance;
  }

  private generateId(): string {
    return Math.random().toString(36);
  }


}