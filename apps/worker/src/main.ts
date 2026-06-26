import { ragEngine } from "@mrb/rag-engine";
import { generateEmbeddings } from "./embeddings/index";

export async function processRagDocument(documentId: string, content: string) {
  const chunks = ragEngine.createChunks(documentId, content);
  const texts = chunks.map((c) => c.text);
  const embeddings = await generateEmbeddings(texts);
  return { chunks, embeddings };
}

console.log("Move Reino Bible Worker — pronto para jobs de importação e embeddings");
