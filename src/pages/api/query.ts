import { OpenAI } from "langchain/llms/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RetrievalQAChain } from "langchain/chains";
import { NextApiRequest, NextApiResponse } from "next";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { QueryRequest, QueryResponse } from "@/util/wire";
import fs from "fs";
import { Document } from "langchain/document";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QueryResponse>
) {
  const data: QueryRequest = req.body;
  const docs = [];

  try {
    for (const fileHash of data.fileHashes) {
      const fileName = `documents/${fileHash}.json`;

      const fileDump = await fs.promises.readFile(fileName, "utf8");

      const fileDocs = JSON.parse(fileDump).map((d: any) => new Document(d));

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splittedDocs = await splitter.splitDocuments(fileDocs);
      docs.push(...splittedDocs);
    }
  } catch (err) {
    res
      .status(200)
      .json({ success: false, error: `Failed to parse documents: ${err}` });
    return;
  }

  if (docs.length === 0) {
    res.status(200).json({
      success: false,
      error: `No documents found`,
    });
    return;
  }

  const embeddings = new OpenAIEmbeddings();

  const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);

  const model = new OpenAI({
    maxTokens: 2048,
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
  });

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  try {
    const resp = await chain.call({
      query: data.query,
    });

    res.status(200).json({ success: true, answer: resp.text });
  } catch (e) {
    console.log(e);
    res.status(200).json({
      success: false,
      error: `Failed to get anser from chain: ${e}`,
    });
  }
}
