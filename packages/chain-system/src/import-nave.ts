import type { ChainNode, PrismaClient } from "@prisma/client";
import { normalizeTopicTitle, parseChainReference } from "./reference-parser.js";

const NAVE_URL =
  "https://raw.githubusercontent.com/basokant/nave/master/data/parsed-nave.json";

export interface NaveImportResult {
  sourceKey: string;
  totalTopics: number;
  totalTopicVerses: number;
  totalChains: number;
  totalChainNodes: number;
  errors: string[];
}

interface NaveNode {
  title: string;
  subtopics: NaveNode[];
  verses: string[];
  relatedTopics: string[];
}

async function ensureSource(prisma: PrismaClient) {
  return prisma.chainSource.upsert({
    where: { sourceKey: "nave" },
    create: {
      sourceKey: "nave",
      title: "Nave's Topical Bible",
      repositoryUrl: "https://github.com/basokant/nave",
      license: "Domínio público (obra clássica)",
      notes: "Nave's Topical Bible — parsed-nave.json",
    },
    update: { importedAt: new Date() },
  });
}

async function importNaveNode(
  prisma: PrismaClient,
  node: NaveNode,
  parentId: string | null,
  counters: { topics: number; verses: number; chains: number; nodes: number },
  errors: string[],
  depth = 0
) {
  const topic = await prisma.chainTopic.create({
    data: {
      title: node.title,
      normalizedTitle: normalizeTopicTitle(node.title),
      parentId,
      sourceKey: "nave",
    },
  });
  counters.topics++;

  const parsedVerses = node.verses
    .map((v) => parseChainReference(v))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  if (node.verses.length && parsedVerses.length < node.verses.length) {
    errors.push(`Nave "${node.title}": ${node.verses.length - parsedVerses.length} refs inválidas`);
  }

  for (let i = 0; i < parsedVerses.length; i++) {
    const ref = parsedVerses[i]!;
    await prisma.chainTopicVerse.create({
      data: {
        topicId: topic.id,
        osisRef: ref.osisRef,
        book: ref.book,
        chapter: ref.chapter,
        verseStart: ref.verseStart,
        verseEnd: ref.verseEnd ?? null,
        chainOrder: i,
        sourceKey: "nave",
      },
    });
    counters.verses++;
  }

  if (parsedVerses.length > 0 && depth > 0) {
    const chain = await prisma.chain.create({
      data: {
        title: node.title,
        normalizedTitle: normalizeTopicTitle(node.title),
        sourceKey: "nave",
      },
    });
    counters.chains++;

    let prevNodeId: string | null = null;
    for (let i = 0; i < parsedVerses.length; i++) {
      const ref = parsedVerses[i]!;
      const created: ChainNode = await prisma.chainNode.create({
        data: {
          chainId: chain.id,
          osisRef: ref.osisRef,
          book: ref.book,
          chapter: ref.chapter,
          verseStart: ref.verseStart,
          verseEnd: ref.verseEnd ?? null,
          orderIndex: i,
          previousNodeId: prevNodeId,
          sourceKey: "nave",
        },
      });
      if (prevNodeId) {
        await prisma.chainNode.update({
          where: { id: prevNodeId },
          data: { nextNodeId: created.id },
        });
      }
      prevNodeId = created.id;
      counters.nodes++;
    }

    await prisma.chainTopic.update({
      where: { id: topic.id },
      data: { chainId: chain.id },
    });
  }

  for (const child of node.subtopics ?? []) {
    await importNaveNode(prisma, child, topic.id, counters, errors, depth + 1);
  }
}

export async function importNaveFromJson(
  prisma: PrismaClient,
  data: NaveNode[]
): Promise<NaveImportResult> {
  await ensureSource(prisma);
  const errors: string[] = [];
  const counters = { topics: 0, verses: 0, chains: 0, nodes: 0 };

  for (const root of data) {
    await importNaveNode(prisma, root, null, counters, errors, 0);
  }

  await prisma.chainImportLog.create({
    data: {
      sourceKey: "nave",
      status: errors.length ? "completed_with_warnings" : "completed",
      totalTopics: counters.topics,
      totalTopicVerses: counters.verses,
      totalChains: counters.chains,
      totalChainNodes: counters.nodes,
      errors: errors.length ? errors.slice(0, 50).join("\n") : null,
    },
  });

  return {
    sourceKey: "nave",
    totalTopics: counters.topics,
    totalTopicVerses: counters.verses,
    totalChains: counters.chains,
    totalChainNodes: counters.nodes,
    errors,
  };
}

export async function fetchNaveJson(): Promise<NaveNode[]> {
  const res = await fetch(NAVE_URL);
  if (!res.ok) throw new Error(`Falha ao baixar Nave: ${res.status}`);
  return res.json() as Promise<NaveNode[]>;
}

export async function importNave(prisma: PrismaClient): Promise<NaveImportResult> {
  const data = await fetchNaveJson();
  return importNaveFromJson(prisma, data);
}
